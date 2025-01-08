# FCTA Sandbox - README

1. Install Node.js from https://nodejs.org/ (choose the LTS version) or use brew
 ```bash
   brew install node
 ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Create a file named `.env.local` and copy this:
   ```
   WORKSPACE_URL=https://adb-19070432379385.5.azuredatabricks.net
   NEXT_PUBLIC_DATABRICKS_TOKEN=paulos_token_here
   NEXT_PUBLIC_BASE_PROMPT="User: Your job is to determine what kind of vibe i'm looking for based on the data available to you. Present these vibes as 1/2 word suggestions \n\nAssistant: What is the vibe of your trip?"
   ```
   

7. Start the project:
   ```bash
   npm run dev
   ```

8. Open http://localhost:3000 in your browser
  
   
9. Terminal will show some console logs but can be improved
