
import json
import urllib.request
import urllib.error
import os

def update_prompt():
    env_vars = {}
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if '=' in line:
                    k, v = line.strip().split('=', 1)
                    env_vars[k] = v

    workflow_id = "erDcGNpNbV5Rxjjv"
    
    if not env_vars.get('N8N_API_KEY') or not env_vars.get('N8N_HOST'):
        print("Missing .env credentials")
        return

    headers = {
        "X-N8N-API-KEY": env_vars.get('N8N_API_KEY', ''),
        "Content-Type": "application/json"
    }

    # 1. GET Latest Workflow
    req_get = urllib.request.Request(f"{env_vars['N8N_HOST']}/api/v1/workflows/{workflow_id}", headers=headers)
    with urllib.request.urlopen(req_get) as response:
        workflow = json.load(response)

    nodes = workflow['nodes']
    updated_node = False

    for node in nodes:
        # Assuming the main agent node is 'OpenRouter Chat Model' or similar
        if 'OpenRouter Chat Model' in node['name'] or 'KB Agent' in node['name']:
            
            # 2. Get current prompt
            # Check different parameter structures
            current_prompt = ""
            if 'options' in node['parameters'] and 'systemMessage' in node['parameters']['options']:
                 current_prompt = node['parameters']['options']['systemMessage']
                 param_loc = 'options.systemMessage'
            elif 'prompt' in node['parameters']:
                 current_prompt = node['parameters']['prompt']
                 param_loc = 'prompt'
            elif 'text' in node['parameters']:
                 current_prompt = node['parameters']['text']
                 param_loc = 'text'
            
            if current_prompt:
                print(f"Found prompt in node: {node['name']}")
                
                # 3. Modify the prompt
                # We'll append/replace the escalation instruction
                
                new_instruction = """
**TONE & STYLE GUIDE:**
- **Be Conversational:** Avoid long lists of bullet points. Use flowing, natural prose as if you are a helpful human assistant.
- **Concise but Clear:** Keep answers direct but professional. 
- **No Robotic Dead-Ends:** Instead of saying "I can only answer X," pivot to how you *can* help or suggest an escalation.

**PROJECT STATUS LOOKUP PROTOCOL:**
If the user asks for a project status:
1. **Data Accuracy:** Provide the **exact** details found in the connected datastore for the following fields:
   - **Project ID**
   - **Project Name**
   - **Start Date**
   - **Status**
   - **Timeline**
   - **Next Steps**
   - **Demo Date**
   - **Due Date**
   - **Project Taken Update** (The latest narrative update)
2. **Missing Info:** If a project ID is not found or a field is empty, clearly state: "The specific details for that field are not yet updated in our system."
3. **Format:** Present these fields in a clean, professional, and easy-to-read format.

**FALLBACK & ESCALATION PROTOCOL:**
If the user asks about "Voice AI Agents" or ANY information NOT in the knowledge base, OR explicitly asks for a human:

1. **CHECK:** Do you have the user's contact information (email or phone) in the conversation history?
2. **IF NO CONTACT INFO:**
   - DO NOT call the escalation tool yet.
   - **DYNAMIC HANDOFF:** Acknowledge concisely why you can't answer (e.g., "I don't have the specific details on [Topic] yet"), explain that a specialist should handle this, and ask for their email/phone naturally so the team can follow up.
   - **DO NOT** use a robotic or canned phrase. Speak like a helpful human assistant.
3. **IF YOU HAVE CONTACT INFO:**
   - Call the `escalate_issue` tool immediately.
   - Pass the `contact_info` and a clear `summary` of their question/issue.
   - After calling the tool, reply: "Thanks! I've passed your details to the team. They will reach out shortly."
"""
                # Remove old escalation instruction if it exists to avoid conflicts
                # (Simple string replacement or just append if not found)
                clean_prompt = current_prompt.split("**ESCALATION:**")[0].strip() # Remove the old escalation tail
                
                # Re-assemble
                final_prompt = f"{clean_prompt}\n\n{new_instruction}"
                
                # 4. Update the node
                if param_loc == 'options.systemMessage':
                    node['parameters']['options']['systemMessage'] = final_prompt
                elif param_loc == 'prompt':
                    node['parameters']['prompt'] = final_prompt
                elif param_loc == 'text':
                    node['parameters']['text'] = final_prompt
                
                updated_node = True
                print("Updated prompt with new fallback logic.")
                break

    if not updated_node:
        print("Could not find suitable node to update.")
        return

    # 5. PUT Back
    payload = {
        "name": workflow['name'],
        "nodes": nodes,
        "connections": workflow['connections'],
        "settings": workflow.get('settings', {"executionOrder": "v1"})
    }

    req_put = urllib.request.Request(f"{env_vars['N8N_HOST']}/api/v1/workflows/{workflow_id}", 
                                   data=json.dumps(payload).encode('utf-8'), 
                                   headers=headers, 
                                   method='PUT')
    try:
        with urllib.request.urlopen(req_put) as response:
            print(f"PROMPT_UPDATE_SUCCESS: {workflow_id}")
    except urllib.error.HTTPError as e:
        print(f"UPDATE_FAILED: {e.code} {e.read().decode('utf-8')}")

if __name__ == "__main__":
    update_prompt()
