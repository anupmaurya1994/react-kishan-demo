const url = 'https://ft.games/api/wof_spin';
const headers = {
  'accept': '*/*',
  'accept-language': 'en-US,en;q=0.9',
  'content-type': 'application/json',
  'cookie': 'auth=d7sPstMEv7ycuqwcy6bb8K9M; __cf_bm=Vxr110Rp2A_zlTI4GTLPYnmRtTj8apcxkmC2Z2dRmqA-1776681647.7863107-1.0.1.1-O7wThi0f2uOusd1rnYCDgUxGfWzRhelvIarx0cHFOY35wA9I9M87X._ZopWpTmANm4HhwmHBES8oVIqKGVYue0v1VuEibyK7KvMSBrp5H3r8Mzx4rDm_yIm3V9MsY.Pt',
  'origin': 'https://ft.games',
  'priority': 'u=1, i',
  'referer': 'https://ft.games/wof/',
  'sec-ch-ua': '"Brave";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'sec-gpc': '1',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36'
};

// Delay between spins in milliseconds (e.g., 1000 = 1 second)
// You can adjust this to spin faster or slower. Be careful not to set it too low to avoid rate limit/IP bans.
const SPIN_DELAY_MS = 1000; 

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function spinContinuously() {
  console.log("=========================================");
  console.log("🎰 Starting Unlimited Spins...");
  console.log("Press Ctrl+C to stop the script.");
  console.log("=========================================\n");
  
  let spinCount = 0;
  
  while (true) {
    try {
      spinCount++;
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: '{}'
      });
      
      const data = await response.text();
      
      try {
        // Try to parse the response as JSON for prettier output
        const jsonData = JSON.parse(data);
        console.log(`[Spin #${spinCount}] Status: ${response.status} | Result:`, jsonData);
        
        // If the server returns an error message like "not enough funds" or similar, 
        // you might want to uncomment the breakdown below:
        /*
        if (jsonData.error) {
           console.log("Stopping due to error:", jsonData.error);
           break;
        }
        */

      } catch (parseError) {
        // Fallback if the response is not valid JSON
        console.log(`[Spin #${spinCount}] Status: ${response.status} | Response: ${data}`);
      }
      
      // Wait before the next spin
      await delay(SPIN_DELAY_MS); 
      
    } catch (error) {
      console.error(`[Spin #${spinCount}] Failed to spin. Error:`, error.message);
      console.log("Waiting a bit longer before retrying...");
      await delay(SPIN_DELAY_MS * 2); 
    }
  }
}

spinContinuously();
