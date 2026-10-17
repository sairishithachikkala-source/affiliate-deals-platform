const { spawn } = require('child_process');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const VIEWPORTS = [320, 360, 375, 390, 768, 1024, 1440];
const PAGES = ['/', '/deals', '/login', '/register', '/admin/login'];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendCDP(ws, method, params = {}) {
  const id = Math.floor(Math.random() * 1000000);
  return new Promise((resolve, reject) => {
    const handleMsg = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handleMsg);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handleMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  console.log('====================================================');
  console.log('DEALNEST INDIA - RESPONSIVE VIEWPORT TEST SUITE');
  console.log('Testing: 320px, 360px, 375px, 390px, 768px, 1024px, 1440px');
  console.log('====================================================\n');

  const userDataDir = path.join(__dirname, '../.edge-test-profile');
  const browserProc = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    'http://localhost:5000/'
  ]);

  let passed = 0;
  let failed = 0;

  try {
    // Wait for CDP to be ready
    let targets = null;
    for (let i = 0; i < 20; i++) {
      await delay(500);
      try {
        const res = await fetch('http://localhost:9222/json');
        if (res.ok) {
          targets = await res.json();
          if (targets && targets.length > 0) break;
        }
      } catch (e) {
        // Retry
      }
    }

    if (!targets || targets.length === 0) {
      throw new Error('Failed to connect to headless Edge via CDP');
    }

    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });

    console.log('Connected to Headless Edge via CDP.\n');

    for (const pagePath of PAGES) {
      console.log(`\n--- Testing Page: ${pagePath} ---`);
      
      // Navigate
      await sendCDP(ws, 'Page.navigate', { url: `http://localhost:5000${pagePath}` });
      await delay(1000); // Allow React hydration & data rendering

      for (const width of VIEWPORTS) {
        const height = width < 768 ? 844 : 900;
        await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
          width,
          height,
          deviceScaleFactor: 1,
          mobile: width < 768
        });
        await delay(200);

        const evalResult = await sendCDP(ws, 'Runtime.evaluate', {
          expression: `
            (() => {
              const docWidth = document.documentElement.scrollWidth;
              const winWidth = window.innerWidth;
              const hasHorizontalScroll = docWidth > winWidth;
              
              function isClipped(el) {
                let parent = el.parentElement;
                while (parent && parent !== document.documentElement && parent !== document.body) {
                  const pStyle = window.getComputedStyle(parent);
                  const ox = pStyle.overflowX;
                  if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') {
                    const pRect = parent.getBoundingClientRect();
                    if (pRect.right <= winWidth + 2) {
                      return true;
                    }
                  }
                  parent = parent.parentElement;
                }
                return false;
              }

              // Find any unclipped overflowing elements
              const overflowing = [];
              document.querySelectorAll('*').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.right > winWidth + 1.5 && !isClipped(el)) {
                  // Only consider visible elements
                  const style = window.getComputedStyle(el);
                  if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && rect.width > 0 && rect.height > 0) {
                    overflowing.push({
                      tag: el.tagName.toLowerCase(),
                      id: el.id,
                      class: (el.className && typeof el.className === 'string') ? el.className.slice(0, 30) : '',
                      right: Math.round(rect.right),
                      width: Math.round(rect.width)
                    });
                  }
                }
              });

              return {
                winWidth,
                docWidth,
                hasHorizontalScroll,
                overflowCount: overflowing.length,
                overflowing: overflowing.slice(0, 3)
              };
            })()
          `,
          returnByValue: true
        });

        const data = evalResult.result.value;
        const testName = `Page ${pagePath} at ${width}px (doc: ${data.docWidth}px, win: ${data.winWidth}px)`;

        if (!data.hasHorizontalScroll && data.overflowCount === 0) {
          console.log(`✅ PASS: ${testName} - No horizontal overflow`);
          passed++;
        } else {
          console.error(`❌ FAIL: ${testName} - Overflows by ${data.docWidth - data.winWidth}px! Overflowing elements:`, data.overflowing);
          failed++;
        }
      }
    }

    ws.close();
  } catch (err) {
    console.error('Test error:', err);
    failed++;
  } finally {
    try {
      browserProc.kill();
    } catch (e) {}
  }

  console.log('\n====================================================');
  console.log(`VIEWPORT TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run();
