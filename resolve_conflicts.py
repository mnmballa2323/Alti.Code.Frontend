import os

def resolve_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception:
        return False
        
    has_conflict = False
    new_lines = []
    
    in_head = False
    in_incoming = False
    
    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            in_head = True
            has_conflict = True
        elif line.startswith('======='):
            in_head = False
            in_incoming = True
        elif line.startswith('>>>>>>>'):
            in_incoming = False
        else:
            if not in_head:
                new_lines.append(line)
                
    if has_conflict:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        return True
    return False

def main():
    root_dir = '/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend'
    count = 0
    for foldername, subfolders, filenames in os.walk(root_dir):
        # skip node_modules
        if 'node_modules' in foldername or '.git' in foldername:
            continue
        for filename in filenames:
            if not filename.endswith('.js') and not filename.endswith('.json'):
                continue
            filepath = os.path.join(foldername, filename)
            if resolve_file(filepath):
                print(f"Resolved: {filepath}")
                count += 1
    print(f"Total resolved: {count}")

if __name__ == '__main__':
    main()
