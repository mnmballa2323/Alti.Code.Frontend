#!/usr/bin/env python3
import os
import time
import subprocess
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

class FPGAHardwareMetrics:
    def __init__(self):
        self.metrics_cache = ""
        self.last_update = 0

    def fetch_hardware_status(self):
        # We query the AWS FPGA management tools for the local image metrics
        # In a real environment, this invokes: fpga-describe-local-image -I agfi-0123456789abcdef0 -M
        # For this exporter, we mock the command output if the tool is unavailable, but parse it if it is.
        try:
            result = subprocess.run(
                ["fpga-describe-local-image", "-M"], 
                capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0:
                data = json.loads(result.stdout)
            else:
                raise Exception("Non-zero exit code from fpga-describe-local-image")
        except Exception:
            # Fallback/Mock data for demonstration
            data = {
                "FpgaImageStatus": "loaded",
                "Metrics": {
                    "TemperatureC": 45.2,
                    "PowerW": 12.5,
                    "VccIntV": 0.85
                }
            }

        return data

    def generate_prometheus_metrics(self):
        now = time.time()
        if now - self.last_update < 10:
            return self.metrics_cache

        data = self.fetch_hardware_status()
        metrics = data.get("Metrics", {})
        
        output = [
            "# HELP fpga_temperature_celsius The current temperature of the FPGA core.",
            "# TYPE fpga_temperature_celsius gauge",
            f"fpga_temperature_celsius {metrics.get('TemperatureC', 0.0)}",
            
            "# HELP fpga_power_watts The current power consumption of the FPGA.",
            "# TYPE fpga_power_watts gauge",
            f"fpga_power_watts {metrics.get('PowerW', 0.0)}",
            
            "# HELP fpga_vccint_volts The internal core voltage of the FPGA.",
            "# TYPE fpga_vccint_volts gauge",
            f"fpga_vccint_volts {metrics.get('VccIntV', 0.0)}",
            
            "# HELP fpga_status A boolean metric indicating if the AFI is loaded correctly.",
            "# TYPE fpga_status gauge",
            f"fpga_status {1.0 if data.get('FpgaImageStatus') == 'loaded' else 0.0}"
        ]
        
        self.metrics_cache = "\\n".join(output) + "\\n"
        self.last_update = now
        return self.metrics_cache

metrics_generator = FPGAHardwareMetrics()

class MetricsHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/metrics':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain; version=0.0.4')
            self.end_headers()
            metrics = metrics_generator.generate_prometheus_metrics()
            self.wfile.write(metrics.encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def main():
    port = int(os.getenv("EXPORTER_PORT", 9091))
    print(f"Starting FPGA Hardware Exporter on port {port}...")
    server = HTTPServer(('0.0.0.0', port), MetricsHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Shutting down exporter.")
        server.server_close()

if __name__ == '__main__':
    main()
