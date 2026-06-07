import os
import sys
import uuid
import logging
import asyncio
from typing import Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Add submodules directory to sys.path so it can import browser_use
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'submodules/browser-use'))

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("browser-use-api")

app = FastAPI(title="Browser-Use API Bridge")

tasks = {}
active_tasks = {}

class RunTaskRequest(BaseModel):
    task: str
    headless: bool = True
    chrome_path: Optional[str] = None
    user_data_dir: Optional[str] = None
    proxy: Optional[str] = None

@app.post("/api/v1/browser/run")
async def run_task(request: RunTaskRequest):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {
        "status": "running",
        "result": None,
        "history": [],
        "error": None
    }

    async def execute_task():
        from browser_use import Agent, ChatGoogle, Browser
        browser_instance = None
        try:
            logger.info(f"Starting task {task_id}: {request.task} (headless={request.headless})")
            model_name = os.getenv('GEMINI_MODEL', 'gemini-2.5-pro')
            api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
            use_vertex = os.getenv('USE_VERTEX_AI', 'false').lower() == 'true'
            
            if use_vertex:
                project = os.getenv('GCP_PROJECT', 'alti-code-studio')
                location = os.getenv('GCP_LOCATION', 'us-central1')
                llm = ChatGoogle(model=model_name, vertexai=True, project=project, location=location)
            else:
                llm = ChatGoogle(model=model_name, api_key=api_key)

            # Configure browser with profile options
            browser_kwargs = {
                "headless": request.headless
            }
            if request.chrome_path:
                browser_kwargs["executable_path"] = request.chrome_path
            if request.user_data_dir:
                browser_kwargs["user_data_dir"] = request.user_data_dir
            if request.proxy:
                from browser_use.browser.profile import ProxySettings
                browser_kwargs["proxy"] = ProxySettings(server=request.proxy)

            browser_instance = Browser(**browser_kwargs)
            
            agent = Agent(
                task=request.task,
                llm=llm,
                browser=browser_instance
            )
            
            history = await agent.run()
            
            final_result = ""
            if hasattr(history, 'final_result'):
                final_res = history.final_result()
                final_result = str(final_res) if final_res is not None else "Success"
            else:
                final_result = str(history)
                
            history_steps = []
            if hasattr(history, 'history'):
                for step in history.history:
                    step_data = {}
                    if hasattr(step, 'model_output') and step.model_output:
                        if hasattr(step.model_output, 'action') and step.model_output.action:
                            step_data["action"] = str(step.model_output.action)
                    if hasattr(step, 'result') and step.result:
                        step_data["result"] = str(step.result)
                    history_steps.append(step_data)
                    
            tasks[task_id] = {
                "status": "completed",
                "result": final_result,
                "history": history_steps,
                "error": None
            }
            logger.info(f"Task {task_id} completed successfully.")
        except asyncio.CancelledError:
            logger.warn(f"Task {task_id} was cancelled.")
            tasks[task_id] = {
                "status": "cancelled",
                "result": None,
                "history": [],
                "error": "Task execution was cancelled by user request."
            }
        except Exception as e:
            logger.error(f"Task {task_id} failed: {e}", exc_info=True)
            tasks[task_id] = {
                "status": "failed",
                "result": None,
                "history": [],
                "error": str(e)
            }
        finally:
            if browser_instance:
                try:
                    await browser_instance.close()
                except Exception as close_err:
                    logger.error(f"Error closing browser for task {task_id}: {close_err}")
            active_tasks.pop(task_id, None)

    # Launch task as an asyncio task and store reference
    loop = asyncio.get_running_loop()
    task = loop.create_task(execute_task())
    active_tasks[task_id] = task

    return {"taskId": task_id, "status": "running"}

@app.get("/api/v1/browser/status/{task_id}")
async def get_task_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks[task_id]

@app.delete("/api/v1/browser/cancel/{task_id}")
async def cancel_task(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task_id in active_tasks:
        logger.info(f"Cancelling task {task_id}...")
        active_tasks[task_id].cancel()
        return {"status": "cancelled", "message": "Cancellation request sent."}
    
    return {"status": tasks[task_id]["status"], "message": "Task is not currently running."}
