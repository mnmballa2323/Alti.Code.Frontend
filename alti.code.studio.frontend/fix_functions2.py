import re

with open('app/functions/page.tsx', 'r') as f:
    content = f.read()

# Add useRef to React imports if not present
if 'useRef' not in content:
    content = content.replace('useState,', 'useState, useRef,')
    content = content.replace('useState }', 'useState, useRef }')

# Add hasAutoSelected ref
if 'hasAutoSelected' not in content:
    content = content.replace(
        'const [isDraft, setIsDraft] = useState(false);',
        'const [isDraft, setIsDraft] = useState(false);\n  const hasAutoSelected = useRef(false);'
    )

# Fix fetchFunctions
old_fetch = """  const fetchFunctions = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/function`, { headers });

      if (res.data?.success) {
        const list = res.data.data || [];

        setFunctions(list);

        // Dispatch list update to the sidebar
        window.dispatchEvent(
          new CustomEvent("sync-functions", { detail: list }),
        );

        if (list.length > 0 && !selectedFunc) {
          selectFunc(list[0]);
        }
      }
    } catch (err) {
      toast.error("Failed to load serverless functions.");
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedFunc]);"""

new_fetch = """  const selectFunc = useCallback((func: ServerlessFunc) => {
    setSelectedFunc(func);
    setName(func.name);
    setDescription(func.description || "");
    setCode(func.code);
    setExecResult(null);
    setIsDraft(false);
    setActiveTab("code");
  }, []);

  const fetchFunctions = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/function`, { headers });

      if (res.data?.success) {
        const list = res.data.data || [];

        setFunctions(list);

        // Dispatch list update to the sidebar
        window.dispatchEvent(
          new CustomEvent("sync-functions", { detail: list }),
        );

        if (list.length > 0 && !hasAutoSelected.current) {
          hasAutoSelected.current = true;
          selectFunc(list[0]);
        }
      }
    } catch (err) {
      toast.error("Failed to load serverless functions.");
    } finally {
      setIsLoading(false);
    }
  }, [token, selectFunc]);"""

if 'hasAutoSelected.current = true;' not in content:
    content = content.replace(old_fetch, new_fetch)
    
    # Now remove the old selectFunc definition
    old_select = """  const selectFunc = (func: ServerlessFunc) => {
    setSelectedFunc(func);
    setName(func.name);
    setDescription(func.description || "");
    setCode(func.code);
    setExecResult(null);
    setIsDraft(false);
    setActiveTab("code");
  };"""
    content = content.replace(old_select, "")

with open('app/functions/page.tsx', 'w') as f:
    f.write(content)
