const path = require('path');
const handlerModule = require(path.join(__dirname, '..', '.next', 'server', 'pages', 'api', 'chat.js'));
console.log('Loaded chat module keys:', Object.keys(handlerModule));

function makeReqRes(body) {
  let statusCode = 200;
  let headers = {};
  return {
    req: {
      method: 'POST',
      body,
    },
    res: {
      status(code) {
        statusCode = code;
        return this;
      },
      setHeader(k, v) {
        headers[k] = v;
      },
      json(payload) {
        console.log('=== RESPONSE STATUS', statusCode);
        console.log('=== RESPONSE JSON');
        console.log(JSON.stringify(payload, null, 2));
      },
      end(payload) {
        console.log('=== RESPONSE STATUS', statusCode);
        console.log('=== RESPONSE END PAYLOAD ===');
        console.log(payload);
      }
    }
  };
}

(async () => {
  try {
    const { req, res } = makeReqRes({ message: 'Hello' });
    // If the module exports default handler as function in .next server bundle, it may be at module.exports.default
    // Determine exported function
    let fn = null;
    if (typeof handlerModule === 'function') fn = handlerModule;
    else if (handlerModule && typeof handlerModule.default === 'function') fn = handlerModule.default;
    else if (handlerModule && typeof handlerModule.handler === 'function') fn = handlerModule.handler;
    else {
      console.error('Could not find handler function in module exports');
      console.error('module keys:', Object.keys(handlerModule));
      return;
    }
    await fn(req, res);
  } catch (e) {
    console.error('Error invoking handler:', e);
  }
})();
