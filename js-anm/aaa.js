var Module = typeof Module !== "undefined" ? Module : {};
var moduleOverrides = {};
var key;
for (key in Module)
  if (Module.hasOwnProperty(key)) moduleOverrides[key] = Module[key];
Module["arguments"] = [];
Module["thisProgram"] = "./this.program";
Module["quit"] = function (status, toThrow) {
  throw toThrow;
};
Module["preRun"] = [];
Module["postRun"] = [];
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === "object";
ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
ENVIRONMENT_IS_NODE =
  typeof process === "object" &&
  typeof require === "function" &&
  !ENVIRONMENT_IS_WEB &&
  !ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL =
  !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
var scriptDirectory = "";
function locateFile(path) {
  if (Module["locateFile"]) return Module["locateFile"](path, scriptDirectory);
  else return scriptDirectory + path;
}
if (ENVIRONMENT_IS_NODE) {
  scriptDirectory = __dirname + "/";
  var nodeFS;
  var nodePath;
  Module["read"] = function shell_read(filename, binary) {
    var ret;
    if (!nodeFS) nodeFS = require("fs");
    if (!nodePath) nodePath = require("path");
    filename = nodePath["normalize"](filename);
    ret = nodeFS["readFileSync"](filename);
    return binary ? ret : ret.toString();
  };
  Module["readBinary"] = function readBinary(filename) {
    var ret = Module["read"](filename, true);
    if (!ret.buffer) ret = new Uint8Array(ret);
    assert(ret.buffer);
    return ret;
  };
  if (process["argv"].length > 1)
    Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/");
  Module["arguments"] = process["argv"].slice(2);
  if (typeof module !== "undefined") module["exports"] = Module;
  process["on"]("uncaughtException", function (ex) {
    if (!(ex instanceof ExitStatus)) throw ex;
  });
  process["on"]("unhandledRejection", abort);
  Module["quit"] = function (status) {
    process["exit"](status);
  };
  Module["inspect"] = function () {
    return "[Emscripten Module object]";
  };
} else if (ENVIRONMENT_IS_SHELL) {
  if (typeof read != "undefined")
    Module["read"] = function shell_read(f) {
      return read(f);
    };
  Module["readBinary"] = function readBinary(f) {
    var data;
    if (typeof readbuffer === "function") return new Uint8Array(readbuffer(f));
    data = read(f, "binary");
    assert(typeof data === "object");
    return data;
  };
  if (typeof scriptArgs != "undefined") Module["arguments"] = scriptArgs;
  else if (typeof arguments != "undefined") Module["arguments"] = arguments;
  if (typeof quit === "function")
    Module["quit"] = function (status) {
      quit(status);
    };
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) scriptDirectory = self.location.href;
  else if (document.currentScript) scriptDirectory = document.currentScript.src;
  if (scriptDirectory.indexOf("blob:") !== 0)
    scriptDirectory = scriptDirectory.substr(
      0,
      scriptDirectory.lastIndexOf("/") + 1
    );
  else scriptDirectory = "";
  Module["read"] = function shell_read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (ENVIRONMENT_IS_WORKER)
    Module["readBinary"] = function readBinary(url) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, false);
      xhr.responseType = "arraybuffer";
      xhr.send(null);
      return new Uint8Array(xhr.response);
    };
  Module["readAsync"] = function readAsync(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function xhr_onload() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
        onload(xhr.response);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };
  Module["setWindowTitle"] = function (title) {
    document.title = title;
  };
} else;
var out =
  Module["print"] ||
  (typeof console !== "undefined"
    ? console.log.bind(console)
    : typeof print !== "undefined"
    ? print
    : null);
var err =
  Module["printErr"] ||
  (typeof printErr !== "undefined"
    ? printErr
    : (typeof console !== "undefined" && console.warn.bind(console)) || out);
for (key in moduleOverrides)
  if (moduleOverrides.hasOwnProperty(key)) Module[key] = moduleOverrides[key];
moduleOverrides = undefined;
var STACK_ALIGN = 16;
function dynamicAlloc(size) {
  var ret = HEAP32[DYNAMICTOP_PTR >> 2];
  var end = (ret + size + 15) & -16;
  if (end <= _emscripten_get_heap_size()) HEAP32[DYNAMICTOP_PTR >> 2] = end;
  else return 0;
  return ret;
}
function getNativeTypeSize(type) {
  switch (type) {
    case "i1":
    case "i8":
      return 1;
    case "i16":
      return 2;
    case "i32":
      return 4;
    case "i64":
      return 8;
    case "float":
      return 4;
    case "double":
      return 8;
    default: {
      if (type[type.length - 1] === "*") return 4;
      else if (type[0] === "i") {
        var bits = parseInt(type.substr(1));
        assert(
          bits % 8 === 0,
          "getNativeTypeSize invalid bits " + bits + ", type " + type
        );
        return bits / 8;
      } else return 0;
    }
  }
}
function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}
var asm2wasmImports = {
  "f64-rem": function (x, y) {
    return x % y;
  },
  debugger: function () {
    debugger;
  },
};
var jsCallStartIndex = 1;
var functionPointers = new Array(0);
function convertJsFunctionToWasm(func, sig) {
  var typeSection = [1, 0, 1, 96];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = {
    i: 127,
    j: 126,
    f: 125,
    d: 124,
  };
  typeSection.push(sigParam.length);
  for (var i = 0; i < sigParam.length; ++i)
    typeSection.push(typeCodes[sigParam[i]]);
  if (sigRet == "v") typeSection.push(0);
  else typeSection = typeSection.concat([1, typeCodes[sigRet]]);
  typeSection[1] = typeSection.length - 2;
  var bytes = new Uint8Array(
    [0, 97, 115, 109, 1, 0, 0, 0].concat(typeSection, [
      2,
      7,
      1,
      1,
      101,
      1,
      102,
      0,
      0,
      7,
      5,
      1,
      1,
      102,
      0,
      0,
    ])
  );
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, {
    e: {
      f: func,
    },
  });
  var wrappedFunc = instance.exports.f;
  return wrappedFunc;
}
var funcWrappers = {};
function dynCall(sig, ptr, args) {
  if (args && args.length)
    return Module["dynCall_" + sig].apply(null, [ptr].concat(args));
  else return Module["dynCall_" + sig].call(null, ptr);
}
var tempRet0 = 0;
var setTempRet0 = function (value) {
  tempRet0 = value;
};
var getTempRet0 = function () {
  return tempRet0;
};
if (typeof WebAssembly !== "object") err("no native wasm support detected");
var wasmMemory;
var wasmTable;
var ABORT = false;
var EXITSTATUS = 0;
function assert(condition, text) {
  if (!condition) abort("Assertion failed: " + text);
}
function getCFunc(ident) {
  var func = Module["_" + ident];
  assert(
    func,
    "Cannot call unknown function " + ident + ", make sure it is exported"
  );
  return func;
}
function ccall(ident, returnType, argTypes, args, opts) {
  var toC = {
    string: function (str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) {
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    array: function (arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
  };
  function convertReturnValue(ret) {
    if (returnType === "string") return UTF8ToString(ret);
    if (returnType === "boolean") return Boolean(ret);
    return ret;
  }
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args)
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else cArgs[i] = args[i];
    }
  var ret = func.apply(null, cArgs);
  ret = convertReturnValue(ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
}
function cwrap(ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  var numericArgs = argTypes.every(function (type) {
    return type === "number";
  });
  var numericRet = returnType !== "string";
  if (numericRet && numericArgs && !opts) return getCFunc(ident);
  return function () {
    return ccall(ident, returnType, argTypes, arguments, opts);
  };
}
function setValue(ptr, value, type, noSafe) {
  type = type || "i8";
  if (type.charAt(type.length - 1) === "*") type = "i32";
  switch (type) {
    case "i1":
      HEAP8[ptr >> 0] = value;
      break;
    case "i8":
      HEAP8[ptr >> 0] = value;
      break;
    case "i16":
      HEAP16[ptr >> 1] = value;
      break;
    case "i32":
      HEAP32[ptr >> 2] = value;
      break;
    case "i64":
      (tempI64 = [
        value >>> 0,
        ((tempDouble = value),
        +Math_abs(tempDouble) >= 1
          ? tempDouble > 0
            ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) |
                0) >>>
              0
            : ~~+Math_ceil(
                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
              ) >>> 0
          : 0),
      ]),
        (HEAP32[ptr >> 2] = tempI64[0]),
        (HEAP32[(ptr + 4) >> 2] = tempI64[1]);
      break;
    case "float":
      HEAPF32[ptr >> 2] = value;
      break;
    case "double":
      HEAPF64[ptr >> 3] = value;
      break;
    default:
      abort("invalid type for setValue: " + type);
  }
}
var ALLOC_NONE = 3;
var UTF8Decoder =
  typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;
function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  while (u8Array[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder)
    return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
  else {
    var str = "";
    while (idx < endPtr) {
      var u0 = u8Array[idx++];
      if (!(u0 & 128)) {
        str += String.fromCharCode(u0);
        continue;
      }
      var u1 = u8Array[idx++] & 63;
      if ((u0 & 224) == 192) {
        str += String.fromCharCode(((u0 & 31) << 6) | u1);
        continue;
      }
      var u2 = u8Array[idx++] & 63;
      if ((u0 & 240) == 224) u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      else
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (u8Array[idx++] & 63);
      if (u0 < 65536) str += String.fromCharCode(u0);
      else {
        var ch = u0 - 65536;
        str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
      }
    }
  }
  return str;
}
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
}
function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343) {
      var u1 = str.charCodeAt(++i);
      u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
    }
    if (u <= 127) {
      if (outIdx >= endIdx) break;
      outU8Array[outIdx++] = u;
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break;
      outU8Array[outIdx++] = 192 | (u >> 6);
      outU8Array[outIdx++] = 128 | (u & 63);
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break;
      outU8Array[outIdx++] = 224 | (u >> 12);
      outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 128 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      outU8Array[outIdx++] = 240 | (u >> 18);
      outU8Array[outIdx++] = 128 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 128 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 128 | (u & 63);
    }
  }
  outU8Array[outIdx] = 0;
  return outIdx - startIdx;
}
function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i);
    if (u >= 55296 && u <= 57343)
      u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023);
    if (u <= 127) ++len;
    else if (u <= 2047) len += 2;
    else if (u <= 65535) len += 3;
    else len += 4;
  }
  return len;
}
var UTF16Decoder =
  typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;
function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) HEAP8[buffer++ >> 0] = str.charCodeAt(i);
  if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}
function demangle(func) {
  return func;
}
function demangleAll(text) {
  var regex = /__Z[\w\d_]+/g;
  return text.replace(regex, function (x) {
    var y = demangle(x);
    return x === y ? x : y + " [" + x + "]";
  });
}
function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    try {
      throw new Error(0);
    } catch (e) {
      err = e;
    }
    if (!err.stack) return "(no stack trace available)";
  }
  return err.stack.toString();
}
var WASM_PAGE_SIZE = 65536;
var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBufferViews() {
  Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
  Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
  Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
  Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
  Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
  Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
  Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
  Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer);
}
var STACK_BASE = 10576,
  DYNAMIC_BASE = 5253456,
  DYNAMICTOP_PTR = 10544;
var TOTAL_STACK = 5242880;
var INITIAL_TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 33554432;
if (INITIAL_TOTAL_MEMORY < TOTAL_STACK)
  err(
    "TOTAL_MEMORY should be larger than TOTAL_STACK, was " +
      INITIAL_TOTAL_MEMORY +
      "! (TOTAL_STACK=" +
      TOTAL_STACK +
      ")"
  );
if (Module["buffer"]) buffer = Module["buffer"];
else if (
  typeof WebAssembly === "object" &&
  typeof WebAssembly.Memory === "function"
) {
  wasmMemory = new WebAssembly.Memory({
    initial: INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE,
    maximum: INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE,
  });
  buffer = wasmMemory.buffer;
} else buffer = new ArrayBuffer(INITIAL_TOTAL_MEMORY);
updateGlobalBufferViews();
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == "function") {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === "number")
      if (callback.arg === undefined) Module["dynCall_v"](func);
      else Module["dynCall_vi"](func, callback.arg);
    else func(callback.arg === undefined ? null : callback.arg);
  }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
function preRun() {
  if (Module["preRun"]) {
    if (typeof Module["preRun"] == "function")
      Module["preRun"] = [Module["preRun"]];
    while (Module["preRun"].length) addOnPreRun(Module["preRun"].shift());
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  runtimeExited = true;
}
function postRun() {
  if (Module["postRun"]) {
    if (typeof Module["postRun"] == "function")
      Module["postRun"] = [Module["postRun"]];
    while (Module["postRun"].length) addOnPostRun(Module["postRun"].shift());
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
var Math_abs = Math.abs;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_min = Math.min;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module["monitorRunDependencies"])
    Module["monitorRunDependencies"](runDependencies);
}
function removeRunDependency(id) {
  runDependencies--;
  if (Module["monitorRunDependencies"])
    Module["monitorRunDependencies"](runDependencies);
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback();
    }
  }
}
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var dataURIPrefix = "data:application/octet-stream;base64,";
function isDataURI(filename) {
  return String.prototype.startsWith
    ? filename.startsWith(dataURIPrefix)
    : filename.indexOf(dataURIPrefix) === 0;
}
var wasmBinaryFile = "lf_core.wasm";
if (!isDataURI(wasmBinaryFile)) wasmBinaryFile = locateFile(wasmBinaryFile);
function getBinary() {
  try {
    if (Module["wasmBinary"]) return new Uint8Array(Module["wasmBinary"]);
    if (Module["readBinary"]) return Module["readBinary"](wasmBinaryFile);
    else throw "both async and sync fetching of the wasm failed";
  } catch (err) {
    abort(err);
  }
}
function getBinaryPromise() {
  if (
    !Module["wasmBinary"] &&
    (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
    typeof fetch === "function"
  )
    return fetch(wasmBinaryFile, {
      credentials: "same-origin",
    })
      .then(function (response) {
        if (!response["ok"])
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        return response["arrayBuffer"]();
      })
      .catch(function () {
        return getBinary();
      });
  return new Promise(function (resolve, reject) {
    resolve(getBinary());
  });
}
function createWasm(env) {
  var info = {
    env: env,
    global: {
      NaN: NaN,
      Infinity: Infinity,
    },
    "global.Math": Math,
    asm2wasm: asm2wasmImports,
  };
  function receiveInstance(instance, module) {
    var exports = instance.exports;
    Module["asm"] = exports;
    removeRunDependency("wasm-instantiate");
  }
  addRunDependency("wasm-instantiate");
  if (Module["instantiateWasm"])
    try {
      return Module["instantiateWasm"](info, receiveInstance);
    } catch (e) {
      err("Module.instantiateWasm callback failed with error: " + e);
      return false;
    }
  function receiveInstantiatedSource(output) {
    receiveInstance(output["instance"]);
  }
  function instantiateArrayBuffer(receiver) {
    getBinaryPromise()
      .then(function (binary) {
        return WebAssembly.instantiate(binary, info);
      })
      .then(receiver, function (reason) {
        err("failed to asynchronously prepare wasm: " + reason);
        abort(reason);
      });
  }
  if (
    !Module["wasmBinary"] &&
    typeof WebAssembly.instantiateStreaming === "function" &&
    !isDataURI(wasmBinaryFile) &&
    typeof fetch === "function"
  )
    WebAssembly.instantiateStreaming(
      fetch(wasmBinaryFile, {
        credentials: "same-origin",
      }),
      info
    ).then(receiveInstantiatedSource, function (reason) {
      err("wasm streaming compile failed: " + reason);
      err("falling back to ArrayBuffer instantiation");
      instantiateArrayBuffer(receiveInstantiatedSource);
    });
  else instantiateArrayBuffer(receiveInstantiatedSource);
  return {};
}
Module["asm"] = function (global, env, providedBuffer) {
  env["memory"] = wasmMemory;
  env["table"] = wasmTable = new WebAssembly.Table({
    initial: 384,
    maximum: 384,
    element: "anyfunc",
  });
  env["__memory_base"] = 1024;
  env["__table_base"] = 0;
  var exports = createWasm(env);
  return exports;
};
var tempDoublePtr = 10560;
function __ZSt18uncaught_exceptionv() {
  return !!__ZSt18uncaught_exceptionv.uncaught_exception;
}
function ___cxa_free_exception(ptr) {
  try {
    return _free(ptr);
  } catch (e) {}
}
var EXCEPTIONS = {
  last: 0,
  caught: [],
  infos: {},
  deAdjust: function (adjusted) {
    if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
    for (var key in EXCEPTIONS.infos) {
      var ptr = +key;
      var adj = EXCEPTIONS.infos[ptr].adjusted;
      var len = adj.length;
      for (var i = 0; i < len; i++) if (adj[i] === adjusted) return ptr;
    }
    return adjusted;
  },
  addRef: function (ptr) {
    if (!ptr) return;
    var info = EXCEPTIONS.infos[ptr];
    info.refcount++;
  },
  decRef: function (ptr) {
    if (!ptr) return;
    var info = EXCEPTIONS.infos[ptr];
    assert(info.refcount > 0);
    info.refcount--;
    if (info.refcount === 0 && !info.rethrown) {
      if (info.destructor) Module["dynCall_vi"](info.destructor, ptr);
      delete EXCEPTIONS.infos[ptr];
      ___cxa_free_exception(ptr);
    }
  },
  clearRef: function (ptr) {
    if (!ptr) return;
    var info = EXCEPTIONS.infos[ptr];
    info.refcount = 0;
  },
};
function ___cxa_begin_catch(ptr) {
  var info = EXCEPTIONS.infos[ptr];
  if (info && !info.caught) {
    info.caught = true;
    __ZSt18uncaught_exceptionv.uncaught_exception--;
  }
  if (info) info.rethrown = false;
  EXCEPTIONS.caught.push(ptr);
  EXCEPTIONS.addRef(EXCEPTIONS.deAdjust(ptr));
  return ptr;
}
function ___cxa_pure_virtual() {
  ABORT = true;
  throw "Pure virtual function called!";
}
function ___resumeException(ptr) {
  if (!EXCEPTIONS.last) EXCEPTIONS.last = ptr;
  throw ptr;
}
function ___cxa_find_matching_catch() {
  var thrown = EXCEPTIONS.last;
  if (!thrown) return (setTempRet0(0), 0) | 0;
  var info = EXCEPTIONS.infos[thrown];
  var throwntype = info.type;
  if (!throwntype) return (setTempRet0(0), thrown) | 0;
  var typeArray = Array.prototype.slice.call(arguments);
  var pointer = Module["___cxa_is_pointer_type"](throwntype);
  if (!___cxa_find_matching_catch.buffer)
    ___cxa_find_matching_catch.buffer = _malloc(4);
  HEAP32[___cxa_find_matching_catch.buffer >> 2] = thrown;
  thrown = ___cxa_find_matching_catch.buffer;
  for (var i = 0; i < typeArray.length; i++)
    if (
      typeArray[i] &&
      Module["___cxa_can_catch"](typeArray[i], throwntype, thrown)
    ) {
      thrown = HEAP32[thrown >> 2];
      info.adjusted.push(thrown);
      return (setTempRet0(typeArray[i]), thrown) | 0;
    }
  thrown = HEAP32[thrown >> 2];
  return (setTempRet0(throwntype), thrown) | 0;
}
function ___gxx_personality_v0() {}
var SYSCALLS = {
  buffers: [null, [], []],
  printChar: function (stream, curr) {
    var buffer = SYSCALLS.buffers[stream];
    if (curr === 0 || curr === 10) {
      (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
      buffer.length = 0;
    } else buffer.push(curr);
  },
  varargs: 0,
  get: function (varargs) {
    SYSCALLS.varargs += 4;
    var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2];
    return ret;
  },
  getStr: function () {
    var ret = UTF8ToString(SYSCALLS.get());
    return ret;
  },
  get64: function () {
    var low = SYSCALLS.get(),
      high = SYSCALLS.get();
    return low;
  },
  getZero: function () {
    SYSCALLS.get();
  },
};
function ___syscall140(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(),
      offset_high = SYSCALLS.get(),
      offset_low = SYSCALLS.get(),
      result = SYSCALLS.get(),
      whence = SYSCALLS.get();
    return 0;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}
function flush_NO_FILESYSTEM() {
  var fflush = Module["_fflush"];
  if (fflush) fflush(0);
  var buffers = SYSCALLS.buffers;
  if (buffers[1].length) SYSCALLS.printChar(1, 10);
  if (buffers[2].length) SYSCALLS.printChar(2, 10);
}
function ___syscall146(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.get(),
      iov = SYSCALLS.get(),
      iovcnt = SYSCALLS.get();
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAP32[(iov + i * 8) >> 2];
      var len = HEAP32[(iov + (i * 8 + 4)) >> 2];
      for (var j = 0; j < len; j++) SYSCALLS.printChar(stream, HEAPU8[ptr + j]);
      ret += len;
    }
    return ret;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}
function ___syscall6(which, varargs) {
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD();
    return 0;
  } catch (e) {
    if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
}
function _abort() {
  Module["abort"]();
}
function _b2WorldBeginContactBody(contactPtr) {
  b2World.BeginContactBody(contactPtr);
}
function _b2WorldEndContactBody(contactPtr) {
  b2World.EndContactBody(contactPtr);
}
function _b2WorldPostSolve(contactPtr, impulsePtr) {
  b2World.PostSolve(contactPtr, impulsePtr);
}
function _b2WorldPreSolve(contactPtr, oldManifoldPtr) {
  b2World.PreSolve(contactPtr, oldManifoldPtr);
}
function _b2WorldQueryAABB(fixturePtr) {
  return b2World.QueryAABB(fixturePtr);
}
function _b2WorldRayCastCallback(
  fixturePtr,
  pointX,
  pointY,
  normalX,
  normalY,
  fraction
) {
  return b2World.RayCast(
    fixturePtr,
    pointX,
    pointY,
    normalX,
    normalY,
    fraction
  );
}
function _emscripten_get_heap_size() {
  return HEAP8.length;
}
function abortOnCannotGrowMemory(requestedSize) {
  abort("OOM");
}
function _emscripten_resize_heap(requestedSize) {
  abortOnCannotGrowMemory(requestedSize);
}
function _llvm_trap() {
  abort("trap!");
}
function _emscripten_memcpy_big(dest, src, num) {
  HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
}
function ___setErrNo(value) {
  if (Module["___errno_location"])
    HEAP32[Module["___errno_location"]() >> 2] = value;
  return value;
}
var ASSERTIONS = false;
var asmGlobalArg = {};
var asmLibraryArg = {
  abort: abort,
  setTempRet0: setTempRet0,
  getTempRet0: getTempRet0,
  __ZSt18uncaught_exceptionv: __ZSt18uncaught_exceptionv,
  ___cxa_begin_catch: ___cxa_begin_catch,
  ___cxa_find_matching_catch: ___cxa_find_matching_catch,
  ___cxa_free_exception: ___cxa_free_exception,
  ___cxa_pure_virtual: ___cxa_pure_virtual,
  ___gxx_personality_v0: ___gxx_personality_v0,
  ___resumeException: ___resumeException,
  ___setErrNo: ___setErrNo,
  ___syscall140: ___syscall140,
  ___syscall146: ___syscall146,
  ___syscall6: ___syscall6,
  _abort: _abort,
  _b2WorldBeginContactBody: _b2WorldBeginContactBody,
  _b2WorldEndContactBody: _b2WorldEndContactBody,
  _b2WorldPostSolve: _b2WorldPostSolve,
  _b2WorldPreSolve: _b2WorldPreSolve,
  _b2WorldQueryAABB: _b2WorldQueryAABB,
  _b2WorldRayCastCallback: _b2WorldRayCastCallback,
  _emscripten_get_heap_size: _emscripten_get_heap_size,
  _emscripten_memcpy_big: _emscripten_memcpy_big,
  _emscripten_resize_heap: _emscripten_resize_heap,
  _llvm_trap: _llvm_trap,
  abortOnCannotGrowMemory: abortOnCannotGrowMemory,
  flush_NO_FILESYSTEM: flush_NO_FILESYSTEM,
  tempDoublePtr: tempDoublePtr,
  DYNAMICTOP_PTR: DYNAMICTOP_PTR,
};
var asm = Module["asm"](asmGlobalArg, asmLibraryArg, buffer);
Module["asm"] = asm;
var ___cxa_can_catch = (Module["___cxa_can_catch"] = function () {
  return Module["asm"]["___cxa_can_catch"].apply(null, arguments);
});
var ___cxa_is_pointer_type = (Module["___cxa_is_pointer_type"] = function () {
  return Module["asm"]["___cxa_is_pointer_type"].apply(null, arguments);
});
var ___errno_location = (Module["___errno_location"] = function () {
  return Module["asm"]["___errno_location"].apply(null, arguments);
});
var _b2Body_ApplyAngularImpulse = (Module[
  "_b2Body_ApplyAngularImpulse"
] = function () {
  return Module["asm"]["_b2Body_ApplyAngularImpulse"].apply(null, arguments);
});
var _b2Body_ApplyForce = (Module["_b2Body_ApplyForce"] = function () {
  return Module["asm"]["_b2Body_ApplyForce"].apply(null, arguments);
});
var _b2Body_ApplyForceToCenter = (Module[
  "_b2Body_ApplyForceToCenter"
] = function () {
  return Module["asm"]["_b2Body_ApplyForceToCenter"].apply(null, arguments);
});
var _b2Body_ApplyLinearImpulse = (Module[
  "_b2Body_ApplyLinearImpulse"
] = function () {
  return Module["asm"]["_b2Body_ApplyLinearImpulse"].apply(null, arguments);
});
var _b2Body_ApplyTorque = (Module["_b2Body_ApplyTorque"] = function () {
  return Module["asm"]["_b2Body_ApplyTorque"].apply(null, arguments);
});
var _b2Body_DestroyFixture = (Module["_b2Body_DestroyFixture"] = function () {
  return Module["asm"]["_b2Body_DestroyFixture"].apply(null, arguments);
});
var _b2Body_GetAngle = (Module["_b2Body_GetAngle"] = function () {
  return Module["asm"]["_b2Body_GetAngle"].apply(null, arguments);
});
var _b2Body_GetAngularVelocity = (Module[
  "_b2Body_GetAngularVelocity"
] = function () {
  return Module["asm"]["_b2Body_GetAngularVelocity"].apply(null, arguments);
});
var _b2Body_GetGravityScale = (Module["_b2Body_GetGravityScale"] = function () {
  return Module["asm"]["_b2Body_GetGravityScale"].apply(null, arguments);
});
var _b2Body_GetInertia = (Module["_b2Body_GetInertia"] = function () {
  return Module["asm"]["_b2Body_GetInertia"].apply(null, arguments);
});
var _b2Body_GetLinearVelocity = (Module[
  "_b2Body_GetLinearVelocity"
] = function () {
  return Module["asm"]["_b2Body_GetLinearVelocity"].apply(null, arguments);
});
var _b2Body_GetLocalPoint = (Module["_b2Body_GetLocalPoint"] = function () {
  return Module["asm"]["_b2Body_GetLocalPoint"].apply(null, arguments);
});
var _b2Body_GetLocalVector = (Module["_b2Body_GetLocalVector"] = function () {
  return Module["asm"]["_b2Body_GetLocalVector"].apply(null, arguments);
});
var _b2Body_GetMass = (Module["_b2Body_GetMass"] = function () {
  return Module["asm"]["_b2Body_GetMass"].apply(null, arguments);
});
var _b2Body_GetPosition = (Module["_b2Body_GetPosition"] = function () {
  return Module["asm"]["_b2Body_GetPosition"].apply(null, arguments);
});
var _b2Body_GetTransform = (Module["_b2Body_GetTransform"] = function () {
  return Module["asm"]["_b2Body_GetTransform"].apply(null, arguments);
});
var _b2Body_GetType = (Module["_b2Body_GetType"] = function () {
  return Module["asm"]["_b2Body_GetType"].apply(null, arguments);
});
var _b2Body_GetWorldCenter = (Module["_b2Body_GetWorldCenter"] = function () {
  return Module["asm"]["_b2Body_GetWorldCenter"].apply(null, arguments);
});
var _b2Body_GetWorldPoint = (Module["_b2Body_GetWorldPoint"] = function () {
  return Module["asm"]["_b2Body_GetWorldPoint"].apply(null, arguments);
});
var _b2Body_GetWorldVector = (Module["_b2Body_GetWorldVector"] = function () {
  return Module["asm"]["_b2Body_GetWorldVector"].apply(null, arguments);
});
var _b2Body_SetAngularVelocity = (Module[
  "_b2Body_SetAngularVelocity"
] = function () {
  return Module["asm"]["_b2Body_SetAngularVelocity"].apply(null, arguments);
});
var _b2Body_SetAwake = (Module["_b2Body_SetAwake"] = function () {
  return Module["asm"]["_b2Body_SetAwake"].apply(null, arguments);
});
var _b2Body_SetFixedRotation = (Module[
  "_b2Body_SetFixedRotation"
] = function () {
  return Module["asm"]["_b2Body_SetFixedRotation"].apply(null, arguments);
});
var _b2Body_SetGravityScale = (Module["_b2Body_SetGravityScale"] = function () {
  return Module["asm"]["_b2Body_SetGravityScale"].apply(null, arguments);
});
var _b2Body_SetLinearVelocity = (Module[
  "_b2Body_SetLinearVelocity"
] = function () {
  return Module["asm"]["_b2Body_SetLinearVelocity"].apply(null, arguments);
});
var _b2Body_SetMassData = (Module["_b2Body_SetMassData"] = function () {
  return Module["asm"]["_b2Body_SetMassData"].apply(null, arguments);
});
var _b2Body_SetTransform = (Module["_b2Body_SetTransform"] = function () {
  return Module["asm"]["_b2Body_SetTransform"].apply(null, arguments);
});
var _b2Body_SetType = (Module["_b2Body_SetType"] = function () {
  return Module["asm"]["_b2Body_SetType"].apply(null, arguments);
});
var _b2ChainShape_CreateFixture = (Module[
  "_b2ChainShape_CreateFixture"
] = function () {
  return Module["asm"]["_b2ChainShape_CreateFixture"].apply(null, arguments);
});
var _b2CircleShape_CreateFixture = (Module[
  "_b2CircleShape_CreateFixture"
] = function () {
  return Module["asm"]["_b2CircleShape_CreateFixture"].apply(null, arguments);
});
var _b2CircleShape_CreateParticleGroup = (Module[
  "_b2CircleShape_CreateParticleGroup"
] = function () {
  return Module["asm"]["_b2CircleShape_CreateParticleGroup"].apply(
    null,
    arguments
  );
});
var _b2CircleShape_DestroyParticlesInShape = (Module[
  "_b2CircleShape_DestroyParticlesInShape"
] = function () {
  return Module["asm"]["_b2CircleShape_DestroyParticlesInShape"].apply(
    null,
    arguments
  );
});
var _b2Contact_GetManifold = (Module["_b2Contact_GetManifold"] = function () {
  return Module["asm"]["_b2Contact_GetManifold"].apply(null, arguments);
});
var _b2Contact_GetWorldManifold = (Module[
  "_b2Contact_GetWorldManifold"
] = function () {
  return Module["asm"]["_b2Contact_GetWorldManifold"].apply(null, arguments);
});
var _b2DistanceJointDef_Create = (Module[
  "_b2DistanceJointDef_Create"
] = function () {
  return Module["asm"]["_b2DistanceJointDef_Create"].apply(null, arguments);
});
var _b2DistanceJointDef_InitializeAndCreate = (Module[
  "_b2DistanceJointDef_InitializeAndCreate"
] = function () {
  return Module["asm"]["_b2DistanceJointDef_InitializeAndCreate"].apply(
    null,
    arguments
  );
});
var _b2EdgeShape_CreateFixture = (Module[
  "_b2EdgeShape_CreateFixture"
] = function () {
  return Module["asm"]["_b2EdgeShape_CreateFixture"].apply(null, arguments);
});
var _b2Fixture_Refilter = (Module["_b2Fixture_Refilter"] = function () {
  return Module["asm"]["_b2Fixture_Refilter"].apply(null, arguments);
});
var _b2Fixture_TestPoint = (Module["_b2Fixture_TestPoint"] = function () {
  return Module["asm"]["_b2Fixture_TestPoint"].apply(null, arguments);
});
var _b2FrictionJointDef_Create = (Module[
  "_b2FrictionJointDef_Create"
] = function () {
  return Module["asm"]["_b2FrictionJointDef_Create"].apply(null, arguments);
});
var _b2FrictionJointDef_InitializeAndCreate = (Module[
  "_b2FrictionJointDef_InitializeAndCreate"
] = function () {
  return Module["asm"]["_b2FrictionJointDef_InitializeAndCreate"].apply(
    null,
    arguments
  );
});
var _b2GearJointDef_Create = (Module["_b2GearJointDef_Create"] = function () {
  return Module["asm"]["_b2GearJointDef_Create"].apply(null, arguments);
});
var _b2GearJoint_GetRatio = (Module["_b2GearJoint_GetRatio"] = function () {
  return Module["asm"]["_b2GearJoint_GetRatio"].apply(null, arguments);
});
var _b2Joint_GetBodyA = (Module["_b2Joint_GetBodyA"] = function () {
  return Module["asm"]["_b2Joint_GetBodyA"].apply(null, arguments);
});
var _b2Joint_GetBodyB = (Module["_b2Joint_GetBodyB"] = function () {
  return Module["asm"]["_b2Joint_GetBodyB"].apply(null, arguments);
});
var _b2Manifold_GetPointCount = (Module[
  "_b2Manifold_GetPointCount"
] = function () {
  return Module["asm"]["_b2Manifold_GetPointCount"].apply(null, arguments);
});
var _b2MotorJointDef_Create = (Module["_b2MotorJointDef_Create"] = function () {
  return Module["asm"]["_b2MotorJointDef_Create"].apply(null, arguments);
});
var _b2MotorJointDef_InitializeAndCreate = (Module[
  "_b2MotorJointDef_InitializeAndCreate"
] = function () {
  return Module["asm"]["_b2MotorJointDef_InitializeAndCreate"].apply(
    null,
    arguments
  );
});
var _b2MotorJoint_SetAngularOffset = (Module[
  "_b2MotorJoint_SetAngularOffset"
] = function () {
  return Module["asm"]["_b2MotorJoint_SetAngularOffset"].apply(null, arguments);
});
var _b2MotorJoint_SetLinearOffset = (Module[
  "_b2MotorJoint_SetLinearOffset"
] = function () {
  return Module["asm"]["_b2MotorJoint_SetLinearOffset"].apply(null, arguments);
});
var _b2MouseJointDef_Create = (Module["_b2MouseJointDef_Create"] = function () {
  return Module["asm"]["_b2MouseJointDef_Create"].apply(null, arguments);
});
var _b2MouseJoint_SetTarget = (Module["_b2MouseJoint_SetTarget"] = function () {
  return Module["asm"]["_b2MouseJoint_SetTarget"].apply(null, arguments);
});
var _b2ParticleGroup_ApplyForce = (Module[
  "_b2ParticleGroup_ApplyForce"
] = function () {
  return Module["asm"]["_b2ParticleGroup_ApplyForce"].apply(null, arguments);
});
var _b2ParticleGroup_ApplyLinearImpulse = (Module[
  "_b2ParticleGroup_ApplyLinearImpulse"
] = function () {
  return Module["asm"]["_b2ParticleGroup_ApplyLinearImpulse"].apply(
    null,
    arguments
  );
});
var _b2ParticleGroup_DestroyParticles = (Module[
  "_b2ParticleGroup_DestroyParticles"
] = function () {
  return Module["asm"]["_b2ParticleGroup_DestroyParticles"].apply(
    null,
    arguments
  );
});
var _b2ParticleGroup_GetBufferIndex = (Module[
  "_b2ParticleGroup_GetBufferIndex"
] = function () {
  return Module["asm"]["_b2ParticleGroup_GetBufferIndex"].apply(
    null,
    arguments
  );
});
var _b2ParticleGroup_GetParticleCount = (Module[
  "_b2ParticleGroup_GetParticleCount"
] = function () {
  return Module["asm"]["_b2ParticleGroup_GetParticleCount"].apply(
    null,
    arguments
  );
});
var _b2ParticleSystem_CreateParticle = (Module[
  "_b2ParticleSystem_CreateParticle"
] = function () {
  return Module["asm"]["_b2ParticleSystem_CreateParticle"].apply(
    null,
    arguments
  );
});
var _b2ParticleSystem_GetColorBuffer = (Module[
  "_b2ParticleSystem_GetColorBuffer"
] = function () {
  return Module["asm"]["_b2ParticleSystem_GetColorBuffer"].apply(
    null,
    arguments
  );
});
var _b2ParticleSystem_GetParticleCount = (Module[
  "_b2ParticleSystem_GetParticleCount"
] = function () {
  return Module["asm"]["_b2ParticleSystem_GetParticleCount"].apply(
    null,
    arguments
  );
});
var _b2ParticleSystem_GetParticleLifetime = (Module[
  "_b2ParticleSystem_GetParticleLifetime"
] = function () {
  return Module["asm"]["_b2ParticleSystem_GetParticleLifetime"].apply(
    null,
    arguments
  );
});
var _b2ParticleSystem_GetPositionBuffer = (Module[
  "_b2ParticleSystem_GetPositionBuffer"
] = function () {
  return Module["asm"]["_b2ParticleSystem_GetPositionBuffer"].apply(
    null,
    arguments
  );
});
var _b2ParticleSystem_GetVelocityBuffer = (Module[
  "_b2ParticleSystem_GetVelocityBuffer"
] = function () {
  return Module["asm"]["_b2ParticleSystem_GetVelocityBuffer"].apply(
    null,
    arguments
  );
});
var _b2ParticleSystem_GetWeightBuffer = (Module[
  "_b2ParticleSystem_GetWeightBuffer"
] = function () {
  return Module["asm"]["_b2ParticleSystem_GetWeightBuffer"].apply(
    null,
    arguments
  );
});
var _b2ParticleSystem_SetDamping = (Module[
  "_b2ParticleSystem_SetDamping"
] = function () {
  return Module["asm"]["_b2ParticleSystem_SetDamping"].apply(null, arguments);
});
var _b2ParticleSystem_SetDensity = (Module[
  "_b2ParticleSystem_SetDensity"
] = function () {
  return Module["asm"]["_b2ParticleSystem_SetDensity"].apply(null, arguments);
});
var _b2ParticleSystem_SetGravityScale = (Module[
  "_b2ParticleSystem_SetGravityScale"
] = function () {
  return Module["asm"]["_b2ParticleSystem_SetGravityScale"].apply(
    null,
    arguments
  );
});
var _b2ParticleSystem_SetMaxParticleCount = (Module[
  "_b2ParticleSystem_SetMaxParticleCount"
] = function () {
  return Module["asm"]["_b2ParticleSystem_SetMaxParticleCount"].apply(
    null,
    arguments
  );
});
var _b2ParticleSystem_SetParticleLifetime = (Module[
  "_b2ParticleSystem_SetParticleLifetime"
] = function () {
  return Module["asm"]["_b2ParticleSystem_SetParticleLifetime"].apply(
    null,
    arguments
  );
});
var _b2ParticleSystem_SetRadius = (Module[
  "_b2ParticleSystem_SetRadius"
] = function () {
  return Module["asm"]["_b2ParticleSystem_SetRadius"].apply(null, arguments);
});
var _b2PolygonShape_CreateFixture_3 = (Module[
  "_b2PolygonShape_CreateFixture_3"
] = function () {
  return Module["asm"]["_b2PolygonShape_CreateFixture_3"].apply(
    null,
    arguments
  );
});
var _b2PolygonShape_CreateFixture_4 = (Module[
  "_b2PolygonShape_CreateFixture_4"
] = function () {
  return Module["asm"]["_b2PolygonShape_CreateFixture_4"].apply(
    null,
    arguments
  );
});
var _b2PolygonShape_CreateFixture_5 = (Module[
  "_b2PolygonShape_CreateFixture_5"
] = function () {
  return Module["asm"]["_b2PolygonShape_CreateFixture_5"].apply(
    null,
    arguments
  );
});
var _b2PolygonShape_CreateFixture_6 = (Module[
  "_b2PolygonShape_CreateFixture_6"
] = function () {
  return Module["asm"]["_b2PolygonShape_CreateFixture_6"].apply(
    null,
    arguments
  );
});
var _b2PolygonShape_CreateFixture_7 = (Module[
  "_b2PolygonShape_CreateFixture_7"
] = function () {
  return Module["asm"]["_b2PolygonShape_CreateFixture_7"].apply(
    null,
    arguments
  );
});
var _b2PolygonShape_CreateFixture_8 = (Module[
  "_b2PolygonShape_CreateFixture_8"
] = function () {
  return Module["asm"]["_b2PolygonShape_CreateFixture_8"].apply(
    null,
    arguments
  );
});
var _b2PolygonShape_CreateParticleGroup_4 = (Module[
  "_b2PolygonShape_CreateParticleGroup_4"
] = function () {
  return Module["asm"]["_b2PolygonShape_CreateParticleGroup_4"].apply(
    null,
    arguments
  );
});
var _b2PolygonShape_DestroyParticlesInShape_4 = (Module[
  "_b2PolygonShape_DestroyParticlesInShape_4"
] = function () {
  return Module["asm"]["_b2PolygonShape_DestroyParticlesInShape_4"].apply(
    null,
    arguments
  );
});
var _b2PrismaticJointDef_Create = (Module[
  "_b2PrismaticJointDef_Create"
] = function () {
  return Module["asm"]["_b2PrismaticJointDef_Create"].apply(null, arguments);
});
var _b2PrismaticJointDef_InitializeAndCreate = (Module[
  "_b2PrismaticJointDef_InitializeAndCreate"
] = function () {
  return Module["asm"]["_b2PrismaticJointDef_InitializeAndCreate"].apply(
    null,
    arguments
  );
});
var _b2PrismaticJoint_EnableLimit = (Module[
  "_b2PrismaticJoint_EnableLimit"
] = function () {
  return Module["asm"]["_b2PrismaticJoint_EnableLimit"].apply(null, arguments);
});
var _b2PrismaticJoint_EnableMotor = (Module[
  "_b2PrismaticJoint_EnableMotor"
] = function () {
  return Module["asm"]["_b2PrismaticJoint_EnableMotor"].apply(null, arguments);
});
var _b2PrismaticJoint_GetJointTranslation = (Module[
  "_b2PrismaticJoint_GetJointTranslation"
] = function () {
  return Module["asm"]["_b2PrismaticJoint_GetJointTranslation"].apply(
    null,
    arguments
  );
});
var _b2PrismaticJoint_GetMotorForce = (Module[
  "_b2PrismaticJoint_GetMotorForce"
] = function () {
  return Module["asm"]["_b2PrismaticJoint_GetMotorForce"].apply(
    null,
    arguments
  );
});
var _b2PrismaticJoint_GetMotorSpeed = (Module[
  "_b2PrismaticJoint_GetMotorSpeed"
] = function () {
  return Module["asm"]["_b2PrismaticJoint_GetMotorSpeed"].apply(
    null,
    arguments
  );
});
var _b2PrismaticJoint_IsLimitEnabled = (Module[
  "_b2PrismaticJoint_IsLimitEnabled"
] = function () {
  return Module["asm"]["_b2PrismaticJoint_IsLimitEnabled"].apply(
    null,
    arguments
  );
});
var _b2PrismaticJoint_IsMotorEnabled = (Module[
  "_b2PrismaticJoint_IsMotorEnabled"
] = function () {
  return Module["asm"]["_b2PrismaticJoint_IsMotorEnabled"].apply(
    null,
    arguments
  );
});
var _b2PrismaticJoint_SetMotorSpeed = (Module[
  "_b2PrismaticJoint_SetMotorSpeed"
] = function () {
  return Module["asm"]["_b2PrismaticJoint_SetMotorSpeed"].apply(
    null,
    arguments
  );
});
var _b2PulleyJointDef_Create = (Module[
  "_b2PulleyJointDef_Create"
] = function () {
  return Module["asm"]["_b2PulleyJointDef_Create"].apply(null, arguments);
});
var _b2PulleyJointDef_InitializeAndCreate = (Module[
  "_b2PulleyJointDef_InitializeAndCreate"
] = function () {
  return Module["asm"]["_b2PulleyJointDef_InitializeAndCreate"].apply(
    null,
    arguments
  );
});
var _b2RevoluteJointDef_Create = (Module[
  "_b2RevoluteJointDef_Create"
] = function () {
  return Module["asm"]["_b2RevoluteJointDef_Create"].apply(null, arguments);
});
var _b2RevoluteJointDef_InitializeAndCreate = (Module[
  "_b2RevoluteJointDef_InitializeAndCreate"
] = function () {
  return Module["asm"]["_b2RevoluteJointDef_InitializeAndCreate"].apply(
    null,
    arguments
  );
});
var _b2RevoluteJoint_EnableLimit = (Module[
  "_b2RevoluteJoint_EnableLimit"
] = function () {
  return Module["asm"]["_b2RevoluteJoint_EnableLimit"].apply(null, arguments);
});
var _b2RevoluteJoint_EnableMotor = (Module[
  "_b2RevoluteJoint_EnableMotor"
] = function () {
  return Module["asm"]["_b2RevoluteJoint_EnableMotor"].apply(null, arguments);
});
var _b2RevoluteJoint_GetJointAngle = (Module[
  "_b2RevoluteJoint_GetJointAngle"
] = function () {
  return Module["asm"]["_b2RevoluteJoint_GetJointAngle"].apply(null, arguments);
});
var _b2RevoluteJoint_IsLimitEnabled = (Module[
  "_b2RevoluteJoint_IsLimitEnabled"
] = function () {
  return Module["asm"]["_b2RevoluteJoint_IsLimitEnabled"].apply(
    null,
    arguments
  );
});
var _b2RevoluteJoint_IsMotorEnabled = (Module[
  "_b2RevoluteJoint_IsMotorEnabled"
] = function () {
  return Module["asm"]["_b2RevoluteJoint_IsMotorEnabled"].apply(
    null,
    arguments
  );
});
var _b2RevoluteJoint_SetMotorSpeed = (Module[
  "_b2RevoluteJoint_SetMotorSpeed"
] = function () {
  return Module["asm"]["_b2RevoluteJoint_SetMotorSpeed"].apply(null, arguments);
});
var _b2RopeJointDef_Create = (Module["_b2RopeJointDef_Create"] = function () {
  return Module["asm"]["_b2RopeJointDef_Create"].apply(null, arguments);
});
var _b2WeldJointDef_Create = (Module["_b2WeldJointDef_Create"] = function () {
  return Module["asm"]["_b2WeldJointDef_Create"].apply(null, arguments);
});
var _b2WeldJointDef_InitializeAndCreate = (Module[
  "_b2WeldJointDef_InitializeAndCreate"
] = function () {
  return Module["asm"]["_b2WeldJointDef_InitializeAndCreate"].apply(
    null,
    arguments
  );
});
var _b2WheelJointDef_Create = (Module["_b2WheelJointDef_Create"] = function () {
  return Module["asm"]["_b2WheelJointDef_Create"].apply(null, arguments);
});
var _b2WheelJointDef_InitializeAndCreate = (Module[
  "_b2WheelJointDef_InitializeAndCreate"
] = function () {
  return Module["asm"]["_b2WheelJointDef_InitializeAndCreate"].apply(
    null,
    arguments
  );
});
var _b2WheelJoint_SetMotorSpeed = (Module[
  "_b2WheelJoint_SetMotorSpeed"
] = function () {
  return Module["asm"]["_b2WheelJoint_SetMotorSpeed"].apply(null, arguments);
});
var _b2WheelJoint_SetSpringFrequencyHz = (Module[
  "_b2WheelJoint_SetSpringFrequencyHz"
] = function () {
  return Module["asm"]["_b2WheelJoint_SetSpringFrequencyHz"].apply(
    null,
    arguments
  );
});
var _b2World_Create = (Module["_b2World_Create"] = function () {
  return Module["asm"]["_b2World_Create"].apply(null, arguments);
});
var _b2World_CreateBody = (Module["_b2World_CreateBody"] = function () {
  return Module["asm"]["_b2World_CreateBody"].apply(null, arguments);
});
var _b2World_CreateParticleSystem = (Module[
  "_b2World_CreateParticleSystem"
] = function () {
  return Module["asm"]["_b2World_CreateParticleSystem"].apply(null, arguments);
});
var _b2World_Delete = (Module["_b2World_Delete"] = function () {
  return Module["asm"]["_b2World_Delete"].apply(null, arguments);
});
var _b2World_DestroyBody = (Module["_b2World_DestroyBody"] = function () {
  return Module["asm"]["_b2World_DestroyBody"].apply(null, arguments);
});
var _b2World_DestroyJoint = (Module["_b2World_DestroyJoint"] = function () {
  return Module["asm"]["_b2World_DestroyJoint"].apply(null, arguments);
});
var _b2World_DestroyParticleSystem = (Module[
  "_b2World_DestroyParticleSystem"
] = function () {
  return Module["asm"]["_b2World_DestroyParticleSystem"].apply(null, arguments);
});
var _b2World_QueryAABB = (Module["_b2World_QueryAABB"] = function () {
  return Module["asm"]["_b2World_QueryAABB"].apply(null, arguments);
});
var _b2World_RayCast = (Module["_b2World_RayCast"] = function () {
  return Module["asm"]["_b2World_RayCast"].apply(null, arguments);
});
var _b2World_SetContactListener = (Module[
  "_b2World_SetContactListener"
] = function () {
  return Module["asm"]["_b2World_SetContactListener"].apply(null, arguments);
});
var _b2World_SetGravity = (Module["_b2World_SetGravity"] = function () {
  return Module["asm"]["_b2World_SetGravity"].apply(null, arguments);
});
var _b2World_Step = (Module["_b2World_Step"] = function () {
  return Module["asm"]["_b2World_Step"].apply(null, arguments);
});
var _free = (Module["_free"] = function () {
  return Module["asm"]["_free"].apply(null, arguments);
});
var _malloc = (Module["_malloc"] = function () {
  return Module["asm"]["_malloc"].apply(null, arguments);
});
var _memcpy = (Module["_memcpy"] = function () {
  return Module["asm"]["_memcpy"].apply(null, arguments);
});
var _memmove = (Module["_memmove"] = function () {
  return Module["asm"]["_memmove"].apply(null, arguments);
});
var _memset = (Module["_memset"] = function () {
  return Module["asm"]["_memset"].apply(null, arguments);
});
var _sbrk = (Module["_sbrk"] = function () {
  return Module["asm"]["_sbrk"].apply(null, arguments);
});
var establishStackSpace = (Module["establishStackSpace"] = function () {
  return Module["asm"]["establishStackSpace"].apply(null, arguments);
});
var stackAlloc = (Module["stackAlloc"] = function () {
  return Module["asm"]["stackAlloc"].apply(null, arguments);
});
var stackRestore = (Module["stackRestore"] = function () {
  return Module["asm"]["stackRestore"].apply(null, arguments);
});
var stackSave = (Module["stackSave"] = function () {
  return Module["asm"]["stackSave"].apply(null, arguments);
});
var dynCall_fif = (Module["dynCall_fif"] = function () {
  return Module["asm"]["dynCall_fif"].apply(null, arguments);
});
var dynCall_fiiiif = (Module["dynCall_fiiiif"] = function () {
  return Module["asm"]["dynCall_fiiiif"].apply(null, arguments);
});
var dynCall_fiiiiif = (Module["dynCall_fiiiiif"] = function () {
  return Module["asm"]["dynCall_fiiiiif"].apply(null, arguments);
});
var dynCall_ii = (Module["dynCall_ii"] = function () {
  return Module["asm"]["dynCall_ii"].apply(null, arguments);
});
var dynCall_iidiiii = (Module["dynCall_iidiiii"] = function () {
  return Module["asm"]["dynCall_iidiiii"].apply(null, arguments);
});
var dynCall_iii = (Module["dynCall_iii"] = function () {
  return Module["asm"]["dynCall_iii"].apply(null, arguments);
});
var dynCall_iiii = (Module["dynCall_iiii"] = function () {
  return Module["asm"]["dynCall_iiii"].apply(null, arguments);
});
var dynCall_iiiii = (Module["dynCall_iiiii"] = function () {
  return Module["asm"]["dynCall_iiiii"].apply(null, arguments);
});
var dynCall_iiiiii = (Module["dynCall_iiiiii"] = function () {
  return Module["asm"]["dynCall_iiiiii"].apply(null, arguments);
});
var dynCall_jiji = (Module["dynCall_jiji"] = function () {
  return Module["asm"]["dynCall_jiji"].apply(null, arguments);
});
var dynCall_v = (Module["dynCall_v"] = function () {
  return Module["asm"]["dynCall_v"].apply(null, arguments);
});
var dynCall_vi = (Module["dynCall_vi"] = function () {
  return Module["asm"]["dynCall_vi"].apply(null, arguments);
});
var dynCall_vii = (Module["dynCall_vii"] = function () {
  return Module["asm"]["dynCall_vii"].apply(null, arguments);
});
var dynCall_viif = (Module["dynCall_viif"] = function () {
  return Module["asm"]["dynCall_viif"].apply(null, arguments);
});
var dynCall_viii = (Module["dynCall_viii"] = function () {
  return Module["asm"]["dynCall_viii"].apply(null, arguments);
});
var dynCall_viiii = (Module["dynCall_viiii"] = function () {
  return Module["asm"]["dynCall_viiii"].apply(null, arguments);
});
var dynCall_viiiii = (Module["dynCall_viiiii"] = function () {
  return Module["asm"]["dynCall_viiiii"].apply(null, arguments);
});
var dynCall_viiiiii = (Module["dynCall_viiiiii"] = function () {
  return Module["asm"]["dynCall_viiiiii"].apply(null, arguments);
});
Module["asm"] = asm;
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
dependenciesFulfilled = function runCaller() {
  if (!Module["calledRun"]) run();
  if (!Module["calledRun"]) dependenciesFulfilled = runCaller;
};
function run(args) {
  args = args || Module["arguments"];
  if (runDependencies > 0) return;
  preRun();
  if (runDependencies > 0) return;
  if (Module["calledRun"]) return;
  function doRun() {
    if (Module["calledRun"]) return;
    Module["calledRun"] = true;
    if (ABORT) return;
    ensureInitRuntime();
    preMain();
    if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
    postRun();
  }
  if (Module["setStatus"]) {
    Module["setStatus"]("Running...");
    setTimeout(function () {
      setTimeout(function () {
        Module["setStatus"]("");
      }, 1);
      doRun();
    }, 1);
  } else doRun();
}
Module["run"] = run;
function abort(what) {
  if (Module["onAbort"]) Module["onAbort"](what);
  if (what !== undefined) {
    out(what);
    err(what);
    what = JSON.stringify(what);
  } else what = "";
  ABORT = true;
  EXITSTATUS = 1;
  throw "abort(" + what + "). Build with -s ASSERTIONS=1 for more info.";
}
Module["abort"] = abort;
if (Module["preInit"]) {
  if (typeof Module["preInit"] == "function")
    Module["preInit"] = [Module["preInit"]];
  while (Module["preInit"].length > 0) Module["preInit"].pop()();
}
Module["noExitRuntime"] = true;
run();
var Offsets = {
  b2Body: {
    type: 0,
    islandIndex: 8,
    xf: 12,
    xf0: 28,
    sweep: 44,
    linearVelocity: 80,
    angularVelocity: 88,
    force: 92,
    torque: 100,
    world: 104,
    prev: 108,
    next: 112,
    fixtureList: 116,
    fixtureCount: 120,
    jointList: 124,
    contactList: 128,
    mass: 132,
    invMass: 136,
    I: 140,
    invI: 144,
    linearDamping: 148,
    angularDamping: 152,
    gravityScale: 156,
    sleepTime: 160,
    userData: 164,
  },
  b2Contact: {
    flags: 4,
    prev: 8,
    next: 12,
    nodeA: 16,
    nodeB: 32,
    fixtureA: 48,
    fixtureB: 52,
    indexA: 56,
    indexB: 60,
    manifold: 64,
    toiCount: 128,
    toi: 132,
    friction: 136,
    restitution: 140,
    tangentSpeed: 144,
  },
  b2Fixture: {
    density: 0,
    next: 4,
    body: 8,
    shape: 12,
    friction: 16,
    restitution: 20,
    proxies: 24,
    proxyCount: 28,
    filter: 32,
    filterCategoryBits: 32,
    filterMaskBits: 34,
    filterGroupIndex: 36,
    isSensor: 38,
    userData: 40,
  },
  b2ParticleGroup: {
    system: 0,
    firstIndex: 4,
    lastIndex: 8,
    groupFlags: 12,
    strength: 16,
    prev: 20,
    next: 24,
    timestamp: 28,
    mass: 32,
    inertia: 36,
    center: 40,
    linearVelocity: 48,
    angularVelocity: 56,
    transform: 60,
    userData: 76,
  },
  b2WorldManifold: {
    normal: 0,
    points: 8,
    separations: 24,
  },
  b2World: {
    bodyList: 102960,
  },
};
var FLT_EPSILON = 1.1920929e-7;
function b2Max(a, b) {
  return new b2Vec2(Math.max(a.x, b.x), Math.max(a.y, b.y));
}
function b2Min(a, b) {
  return new b2Vec2(Math.min(a.x, b.x), Math.min(a.y, b.y));
}
function b2Clamp(a, low, high) {
  return b2Max(low, b2Min(a, high));
}
function b2Vec2(x, y) {
  if (x === undefined) x = 0;
  if (y === undefined) y = 0;
  this.x = x;
  this.y = y;
}
b2Vec2.Add = function (out, a, b) {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
};
b2Vec2.CrossScalar = function (output, input, scalar) {
  output.x = -scalar * input.y;
  output.y = scalar * input.x;
};
b2Vec2.Cross = function (a, b) {
  return a.x * b.y - a.y * b.x;
};
b2Vec2.MulScalar = function (out, input, scalar) {
  out.x = input.x * scalar;
  out.y = input.y * scalar;
};
b2Vec2.Mul = function (out, T, v) {
  var Tp = T.p;
  var Tqc = T.q.c;
  var Tqs = T.q.s;
  var x = v.x;
  var y = v.y;
  out.x = Tqc * x - Tqs * y + Tp.x;
  out.y = Tqs * x + Tqc * y + Tp.y;
};
b2Vec2.Normalize = function (out, input) {
  var length = input.Length();
  if (length < FLT_EPSILON) {
    out.x = 0;
    out.y = 0;
    return;
  }
  var invLength = 1 / length;
  out.x = input.x * invLength;
  out.y = input.y * invLength;
};
b2Vec2.Sub = function (out, input, subtract) {
  out.x = input.x - subtract.x;
  out.y = input.y - subtract.y;
};
b2Vec2.prototype.Clone = function () {
  return new b2Vec2(this.x, this.y);
};
b2Vec2.prototype.Set = function (x, y) {
  this.x = x;
  this.y = y;
};
b2Vec2.prototype.Length = function () {
  var x = this.x;
  var y = this.y;
  return Math.sqrt(x * x + y * y);
};
b2Vec2.prototype.LengthSquared = function () {
  var x = this.x;
  var y = this.y;
  return x * x + y * y;
};
function b2Rot(radians) {
  if (radians === undefined) radians = 0;
  this.s = Math.sin(radians);
  this.c = Math.cos(radians);
}
b2Rot.prototype.Set = function (radians) {
  this.s = Math.sin(radians);
  this.c = Math.cos(radians);
};
b2Rot.prototype.SetIdentity = function () {
  this.s = 0;
  this.c = 1;
};
b2Rot.prototype.GetXAxis = function () {
  return new b2Vec2(this.c, this.s);
};
function b2Transform(position, rotation) {
  if (position === undefined) position = new b2Vec2();
  if (rotation === undefined) rotation = new b2Rot();
  this.p = position;
  this.q = rotation;
}
b2Transform.prototype.FromFloat64Array = function (arr) {
  var p = this.p;
  var q = this.q;
  p.x = arr[0];
  p.y = arr[1];
  q.s = arr[2];
  q.c = arr[3];
};
b2Transform.prototype.SetIdentity = function () {
  this.p.Set(0, 0);
  this.q.SetIdentity();
};
function b2AABB() {
  this.lowerBound = new b2Vec2();
  this.upperBound = new b2Vec2();
}
b2AABB.prototype.GetCenter = function () {
  var sum = new b2Vec2();
  b2Vec2.Add(sum, this.lowerBound, this.upperBound);
  b2Vec2.MulScalar(sum, sum, 0.5);
};
var b2Manifold_GetPointCount = Module.cwrap(
  "b2Manifold_GetPointCount",
  "number",
  ["number"]
);
function b2Manifold(ptr) {
  this.ptr = ptr;
}
b2Manifold.prototype.GetPointCount = function () {
  return b2Manifold_GetPointCount(this.ptr);
};
var b2WorldManifold_points_offset = Offsets.b2WorldManifold.points;
function b2WorldManifold(ptr) {
  this.buffer = new DataView(Module.HEAPU8.buffer, ptr);
  this.ptr = ptr;
}
b2WorldManifold.prototype.GetPoint = function (i) {
  var point = new b2Vec2();
  point.x = this.buffer.getFloat32(i * 8 + b2WorldManifold_points_offset, true);
  point.y = this.buffer.getFloat32(
    i * 8 + 4 + b2WorldManifold_points_offset,
    true
  );
  return point;
};
var b2EdgeShape_CreateFixture = Module.cwrap(
  "b2EdgeShape_CreateFixture",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
function b2EdgeShape() {
  this.hasVertex0 = false;
  this.hasVertex3 = false;
  this.vertex0 = new b2Vec2();
  this.vertex1 = new b2Vec2();
  this.vertex2 = new b2Vec2();
  this.vertex3 = new b2Vec2();
  this.type = b2Shape_Type_e_edge;
}
b2EdgeShape.prototype.Set = function (v1, v2) {
  this.vertex1 = v1;
  this.vertex2 = v2;
  this.hasVertex0 = false;
  this.hasVertex3 = false;
};
b2EdgeShape.prototype._CreateFixture = function (body, fixtureDef) {
  return b2EdgeShape_CreateFixture(
    body.ptr,
    fixtureDef.density,
    fixtureDef.friction,
    fixtureDef.isSensor,
    fixtureDef.restitution,
    fixtureDef.userData,
    fixtureDef.filter.categoryBits,
    fixtureDef.filter.groupIndex,
    fixtureDef.filter.maskBits,
    this.hasVertex0,
    this.hasVertex3,
    this.vertex0.x,
    this.vertex0.y,
    this.vertex1.x,
    this.vertex1.y,
    this.vertex2.x,
    this.vertex2.y,
    this.vertex3.x,
    this.vertex3.y
  );
};
var b2PolygonShape_CreateFixture_3 = Module.cwrap(
  "b2PolygonShape_CreateFixture_3",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2PolygonShape_CreateFixture_4 = Module.cwrap(
  "b2PolygonShape_CreateFixture_4",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2PolygonShape_CreateFixture_5 = Module.cwrap(
  "b2PolygonShape_CreateFixture_5",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2PolygonShape_CreateFixture_6 = Module.cwrap(
  "b2PolygonShape_CreateFixture_6",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2PolygonShape_CreateFixture_7 = Module.cwrap(
  "b2PolygonShape_CreateFixture_7",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2PolygonShape_CreateFixture_8 = Module.cwrap(
  "b2PolygonShape_CreateFixture_8",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2PolygonShape_CreateParticleGroup_4 = Module.cwrap(
  "b2PolygonShape_CreateParticleGroup_4",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2PolygonShape_DestroyParticlesInShape_4 = Module.cwrap(
  "b2PolygonShape_DestroyParticlesInShape_4",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
function b2PolygonShape() {
  this.position = new b2Vec2();
  this.vertices = [];
  this.type = b2Shape_Type_e_polygon;
}
b2PolygonShape.prototype.SetAsBoxXY = function (hx, hy) {
  this.vertices[0] = new b2Vec2(-hx, -hy);
  this.vertices[1] = new b2Vec2(hx, -hy);
  this.vertices[2] = new b2Vec2(hx, hy);
  this.vertices[3] = new b2Vec2(-hx, hy);
};
b2PolygonShape.prototype.SetAsBoxXYCenterAngle = function (
  hx,
  hy,
  center,
  angle
) {
  this.vertices[0] = new b2Vec2(-hx, -hy);
  this.vertices[1] = new b2Vec2(hx, -hy);
  this.vertices[2] = new b2Vec2(hx, hy);
  this.vertices[3] = new b2Vec2(-hx, hy);
  var xf = new b2Transform();
  xf.p = center;
  xf.q.Set(angle);
  for (var i = 0; i < 4; i++)
    b2Vec2.Mul(this.vertices[i], xf, this.vertices[i]);
};
b2PolygonShape.prototype._CreateFixture = function (body, fixtureDef) {
  var vertices = this.vertices;
  switch (vertices.length) {
    case 3:
      var v0 = vertices[0];
      var v1 = vertices[1];
      var v2 = vertices[2];
      return b2PolygonShape_CreateFixture_3(
        body.ptr,
        fixtureDef.density,
        fixtureDef.friction,
        fixtureDef.isSensor,
        fixtureDef.restitution,
        fixtureDef.userData,
        fixtureDef.filter.categoryBits,
        fixtureDef.filter.groupIndex,
        fixtureDef.filter.maskBits,
        v0.x,
        v0.y,
        v1.x,
        v1.y,
        v2.x,
        v2.y
      );
      break;
    case 4:
      var v0 = vertices[0];
      var v1 = vertices[1];
      var v2 = vertices[2];
      var v3 = vertices[3];
      return b2PolygonShape_CreateFixture_4(
        body.ptr,
        fixtureDef.density,
        fixtureDef.friction,
        fixtureDef.isSensor,
        fixtureDef.restitution,
        fixtureDef.userData,
        fixtureDef.filter.categoryBits,
        fixtureDef.filter.groupIndex,
        fixtureDef.filter.maskBits,
        v0.x,
        v0.y,
        v1.x,
        v1.y,
        v2.x,
        v2.y,
        v3.x,
        v3.y
      );
      break;
    case 5:
      var v0 = vertices[0];
      var v1 = vertices[1];
      var v2 = vertices[2];
      var v3 = vertices[3];
      var v4 = vertices[4];
      return b2PolygonShape_CreateFixture_5(
        body.ptr,
        fixtureDef.density,
        fixtureDef.friction,
        fixtureDef.isSensor,
        fixtureDef.restitution,
        fixtureDef.userData,
        fixtureDef.filter.categoryBits,
        fixtureDef.filter.groupIndex,
        fixtureDef.filter.maskBits,
        v0.x,
        v0.y,
        v1.x,
        v1.y,
        v2.x,
        v2.y,
        v3.x,
        v3.y,
        v4.x,
        v4.y
      );
      break;
    case 6:
      var v0 = vertices[0];
      var v1 = vertices[1];
      var v2 = vertices[2];
      var v3 = vertices[3];
      var v4 = vertices[4];
      var v5 = vertices[5];
      return b2PolygonShape_CreateFixture_6(
        body.ptr,
        fixtureDef.density,
        fixtureDef.friction,
        fixtureDef.isSensor,
        fixtureDef.restitution,
        fixtureDef.userData,
        fixtureDef.filter.categoryBits,
        fixtureDef.filter.groupIndex,
        fixtureDef.filter.maskBits,
        v0.x,
        v0.y,
        v1.x,
        v1.y,
        v2.x,
        v2.y,
        v3.x,
        v3.y,
        v4.x,
        v4.y,
        v5.x,
        v5.y
      );
      break;
    case 7:
      var v0 = vertices[0];
      var v1 = vertices[1];
      var v2 = vertices[2];
      var v3 = vertices[3];
      var v4 = vertices[4];
      var v5 = vertices[5];
      var v6 = vertices[6];
      return b2PolygonShape_CreateFixture_7(
        body.ptr,
        fixtureDef.density,
        fixtureDef.friction,
        fixtureDef.isSensor,
        fixtureDef.restitution,
        fixtureDef.userData,
        fixtureDef.filter.categoryBits,
        fixtureDef.filter.groupIndex,
        fixtureDef.filter.maskBits,
        v0.x,
        v0.y,
        v1.x,
        v1.y,
        v2.x,
        v2.y,
        v3.x,
        v3.y,
        v4.x,
        v4.y,
        v5.x,
        v5.y,
        v6.x,
        v6.y
      );
      break;
    case 8:
      var v0 = vertices[0];
      var v1 = vertices[1];
      var v2 = vertices[2];
      var v3 = vertices[3];
      var v4 = vertices[4];
      var v5 = vertices[5];
      var v6 = vertices[6];
      var v7 = vertices[7];
      return b2PolygonShape_CreateFixture_8(
        body.ptr,
        fixtureDef.density,
        fixtureDef.friction,
        fixtureDef.isSensor,
        fixtureDef.restitution,
        fixtureDef.userData,
        fixtureDef.filter.categoryBits,
        fixtureDef.filter.groupIndex,
        fixtureDef.filter.maskBits,
        v0.x,
        v0.y,
        v1.x,
        v1.y,
        v2.x,
        v2.y,
        v3.x,
        v3.y,
        v4.x,
        v4.y,
        v5.x,
        v5.y,
        v6.x,
        v6.y,
        v6.x,
        v7.y
      );
      break;
  }
};
b2PolygonShape.prototype._CreateParticleGroup = function (particleSystem, pgd) {
  var v = this.vertices;
  switch (v.length) {
    case 3:
      break;
    case 4:
      return b2PolygonShape_CreateParticleGroup_4(
        particleSystem.ptr,
        pgd.angle,
        pgd.angularVelocity,
        pgd.color.r,
        pgd.color.g,
        pgd.color.b,
        pgd.color.a,
        pgd.flags,
        pgd.group.ptr,
        pgd.groupFlags,
        pgd.lifetime,
        pgd.linearVelocity.x,
        pgd.linearVelocity.y,
        pgd.position.x,
        pgd.position.y,
        pgd.positionData,
        pgd.particleCount,
        pgd.strength,
        pgd.stride,
        pgd.userData,
        v[0].x,
        v[0].y,
        v[1].x,
        v[1].y,
        v[2].x,
        v[2].y,
        v[3].x,
        v[3].y
      );
      break;
  }
};
b2PolygonShape.prototype._DestroyParticlesInShape = function (ps, xf) {
  var v = this.vertices;
  switch (v.length) {
    case 3:
      break;
    case 4:
      return b2PolygonShape_DestroyParticlesInShape_4(
        ps.ptr,
        v[0].x,
        v[0].y,
        v[1].x,
        v[1].y,
        v[2].x,
        v[2].y,
        v[3].x,
        v[3].y,
        xf.p.x,
        xf.p.y,
        xf.q.s,
        xf.q.c
      );
      break;
  }
};
b2PolygonShape.prototype.Validate = function () {
  for (var i = 0, max = this.vertices.length; i < max; ++i) {
    var i1 = i;
    var i2 = i < max - 1 ? i1 + 1 : 0;
    var p = this.vertices[i1];
    var e = this.vertices[i2];
    var eSubP = new b2Vec2();
    b2Vec2.Sub(eSubP, e, p);
    for (var j = 0; j < max; ++j) {
      if (j == i1 || j == i2) continue;
      var v = new b2Vec2();
      b2Vec2.Sub(v, this.vertices[j], p);
      var c = b2Vec2.Cross(eSubP, v);
      if (c < 0) return false;
    }
  }
  return true;
};
var b2Shape_Type_e_circle = 0;
var b2Shape_Type_e_edge = 1;
var b2Shape_Type_e_polygon = 2;
var b2Shape_Type_e_chain = 3;
var b2Shape_Type_e_typeCount = 4;
var b2_linearSlop = 0.005;
var b2_polygonRadius = 2 * b2_linearSlop;
var b2_maxPolygonVertices = 8;
function b2MassData(mass, center, I) {
  this.mass = mass;
  this.center = center;
  this.I = I;
}
var b2ChainShape_CreateFixture = Module.cwrap(
  "b2ChainShape_CreateFixture",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
function b2ChainShape() {
  this.radius = b2_polygonRadius;
  this.vertices = [];
  this.type = b2Shape_Type_e_chain;
}
b2ChainShape.prototype.CreateLoop = function () {
  this.vertices.push(this.vertices[0]);
};
b2ChainShape.prototype._CreateFixture = function (body, fixtureDef) {
  var vertices = this.vertices;
  var chainLength = vertices.length;
  var dataLength = chainLength * 2;
  var data = new Float32Array(dataLength);
  for (var i = 0, j = 0; i < dataLength; i += 2, j++) {
    data[i] = vertices[j].x;
    data[i + 1] = vertices[j].y;
  }
  var nDataBytes = data.length * data.BYTES_PER_ELEMENT;
  var dataPtr = Module._malloc(nDataBytes);
  var dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
  dataHeap.set(new Uint8Array(data.buffer));
  var fixture = b2ChainShape_CreateFixture(
    body.ptr,
    fixtureDef.density,
    fixtureDef.friction,
    fixtureDef.isSensor,
    fixtureDef.restitution,
    fixtureDef.userData,
    fixtureDef.filter.categoryBits,
    fixtureDef.filter.groupIndex,
    fixtureDef.filter.maskBits,
    dataHeap.byteOffset,
    data.length
  );
  Module._free(dataHeap.byteOffset);
  return fixture;
};
var b2CircleShape_CreateFixture = Module.cwrap(
  "b2CircleShape_CreateFixture",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2CircleShape_CreateParticleGroup = Module.cwrap(
  "b2CircleShape_CreateParticleGroup",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2CircleShape_DestroyParticlesInShape = Module.cwrap(
  "b2CircleShape_DestroyParticlesInShape",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
function b2CircleShape() {
  this.position = new b2Vec2();
  this.radius = 0;
  this.type = b2Shape_Type_e_circle;
}
b2CircleShape.prototype._CreateFixture = function (body, fixtureDef) {
  return b2CircleShape_CreateFixture(
    body.ptr,
    fixtureDef.density,
    fixtureDef.friction,
    fixtureDef.isSensor,
    fixtureDef.restitution,
    fixtureDef.userData,
    fixtureDef.filter.categoryBits,
    fixtureDef.filter.groupIndex,
    fixtureDef.filter.maskBits,
    this.position.x,
    this.position.y,
    this.radius
  );
};
b2CircleShape.prototype._CreateParticleGroup = function (particleSystem, pgd) {
  return b2CircleShape_CreateParticleGroup(
    particleSystem.ptr,
    pgd.angle,
    pgd.angularVelocity,
    pgd.color.r,
    pgd.color.g,
    pgd.color.b,
    pgd.color.a,
    pgd.flags,
    pgd.group.ptr,
    pgd.groupFlags,
    pgd.lifetime,
    pgd.linearVelocity.x,
    pgd.linearVelocity.y,
    pgd.position.x,
    pgd.position.y,
    pgd.positionData,
    pgd.particleCount,
    pgd.strength,
    pgd.stride,
    pgd.userData,
    this.position.x,
    this.position.y,
    this.radius
  );
};
b2CircleShape.prototype._DestroyParticlesInShape = function (ps, xf) {
  return b2CircleShape_DestroyParticlesInShape(
    ps.ptr,
    this.position.x,
    this.position.y,
    this.radius,
    xf.p.x,
    xf.p.y,
    xf.q.s,
    xf.q.c
  );
};
var b2Body_ApplyAngularImpulse = Module.cwrap(
  "b2Body_ApplyAngularImpulse",
  "null",
  ["number", "number", "number"]
);
var b2Body_ApplyLinearImpulse = Module.cwrap(
  "b2Body_ApplyLinearImpulse",
  "null",
  ["number", "number", "number", "number", "number", "number"]
);
var b2Body_ApplyForce = Module.cwrap("b2Body_ApplyForce", "number", [
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
]);
var b2Body_ApplyForceToCenter = Module.cwrap(
  "b2Body_ApplyForceToCenter",
  "number",
  ["number", "number", "number", "number"]
);
var b2Body_ApplyTorque = Module.cwrap("b2Body_ApplyTorque", "number", [
  "number",
  "number",
  "number",
]);
var b2Body_DestroyFixture = Module.cwrap("b2Body_DestroyFixture", "null", [
  "number",
  "number",
]);
var b2Body_GetAngle = Module.cwrap("b2Body_GetAngle", "number", ["number"]);
var b2Body_GetAngularVelocity = Module.cwrap(
  "b2Body_GetAngularVelocity",
  "number",
  ["number"]
);
var b2Body_GetInertia = Module.cwrap("b2Body_GetInertia", "number", ["number"]);
var b2Body_GetLinearVelocity = Module.cwrap(
  "b2Body_GetLinearVelocity",
  "null",
  ["number", "number"]
);
var b2Body_GetLocalPoint = Module.cwrap("b2Body_GetLocalPoint", "null", [
  "number",
  "number",
  "number",
  "number",
]);
var b2Body_GetLocalVector = Module.cwrap("b2Body_GetLocalVector", "null", [
  "number",
  "number",
  "number",
  "number",
]);
var b2Body_GetMass = Module.cwrap("b2Body_GetMass", "number", ["number"]);
var b2Body_GetPosition = Module.cwrap("b2Body_GetPosition", "null", [
  "number",
  "number",
]);
var b2Body_GetTransform = Module.cwrap("b2Body_GetTransform", "null", [
  "number",
  "number",
]);
var b2Body_GetType = Module.cwrap("b2Body_GetType", "number", ["number"]);
var b2Body_GetWorldCenter = Module.cwrap("b2Body_GetWorldCenter", "null", [
  "number",
  "number",
]);
var b2Body_GetWorldPoint = Module.cwrap("b2Body_GetWorldPoint", "null", [
  "number",
  "number",
  "number",
  "number",
]);
var b2Body_GetWorldVector = Module.cwrap("b2Body_GetWorldVector", "null", [
  "number",
  "number",
  "number",
  "number",
]);
var b2Body_SetAngularVelocity = Module.cwrap(
  "b2Body_SetAngularVelocity",
  "null",
  ["number", "number"]
);
var b2Body_SetAwake = Module.cwrap("b2Body_SetAwake", "number", [
  "number",
  "number",
]);
var b2Body_SetFixedRotation = Module.cwrap(
  "b2Body_SetFixedRotation",
  "number",
  ["number", "number"]
);
var b2Body_SetLinearVelocity = Module.cwrap(
  "b2Body_SetLinearVelocity",
  "null",
  ["number", "number", "number"]
);
var b2Body_SetMassData = Module.cwrap("b2Body_SetMassData", "null", [
  "number",
  "number",
  "number",
  "number",
  "number",
]);
var b2Body_SetTransform = Module.cwrap("b2Body_SetTransform", "null", [
  "number",
  "number",
  "number",
]);
var b2Body_SetType = Module.cwrap("b2Body_SetType", "null", [
  "number",
  "number",
]);
var b2Body_SetGravityScale = Module.cwrap("b2Body_SetGravityScale", "null", [
  "number",
  "number",
]);
var b2Body_GetGravityScale = Module.cwrap("b2Body_GetGravityScale", "number", [
  "number",
]);
var b2Body_xf_offset = Offsets.b2Body.xf;
var b2Body_userData_offset = Offsets.b2Body.userData;
function b2Body(ptr) {
  this.buffer = new DataView(Module.HEAPU8.buffer, ptr);
  this.ptr = ptr;
  this.fixtures = [];
}
b2Body.prototype.ApplyAngularImpulse = function (impulse, wake) {
  b2Body_ApplyAngularImpulse(this.ptr, impulse, wake);
};
b2Body.prototype.ApplyLinearImpulse = function (impulse, point, wake) {
  b2Body_ApplyLinearImpulse(
    this.ptr,
    impulse.x,
    impulse.y,
    point.x,
    point.y,
    wake
  );
};
b2Body.prototype.ApplyForce = function (force, point, wake) {
  b2Body_ApplyForce(this.ptr, force.x, force.y, point.x, point.y, wake);
};
b2Body.prototype.ApplyForceToCenter = function (force, wake) {
  b2Body_ApplyForceToCenter(this.ptr, force.x, force.y, wake);
};
b2Body.prototype.ApplyTorque = function (force, wake) {
  b2Body_ApplyTorque(this.ptr, force, wake);
};
b2Body.prototype.CreateFixtureFromDef = function (fixtureDef) {
  var fixture = new b2Fixture();
  fixture.FromFixtureDef(fixtureDef);
  fixture._SetPtr(fixtureDef.shape._CreateFixture(this, fixtureDef));
  fixture.body = this;
  b2World._Push(fixture, this.fixtures);
  world.fixturesLookup[fixture.ptr] = fixture;
  fixture.SetFilterData(fixtureDef.filter);
  return fixture;
};
b2Body.prototype.CreateFixtureFromShape = function (shape, density) {
  var fixtureDef = new b2FixtureDef();
  fixtureDef.shape = shape;
  fixtureDef.density = density;
  return this.CreateFixtureFromDef(fixtureDef);
};
b2Body.prototype.DestroyFixture = function (fixture) {
  b2Body_DestroyFixture(this.ptr, fixture.ptr);
  b2World._RemoveItem(fixture, this.fixtures);
};
b2Body.prototype.GetAngle = function () {
  return b2Body_GetAngle(this.ptr);
};
b2Body.prototype.GetAngularVelocity = function () {
  return b2Body_GetAngularVelocity(this.ptr);
};
b2Body.prototype.GetInertia = function () {
  return b2Body_GetInertia(this.ptr);
};
b2Body.prototype.GetMass = function () {
  return b2Body_GetMass(this.ptr);
};
b2Body.prototype.GetLinearVelocity = function () {
  b2Body_GetLinearVelocity(this.ptr, _vec2Buf.byteOffset);
  var result = new Float32Array(
    _vec2Buf.buffer,
    _vec2Buf.byteOffset,
    _vec2Buf.length
  );
  return new b2Vec2(result[0], result[1]);
};
b2Body.prototype.GetLocalPoint = function (vec) {
  b2Body_GetLocalPoint(this.ptr, vec.x, vec.y, _vec2Buf.byteOffset);
  var result = new Float32Array(
    _vec2Buf.buffer,
    _vec2Buf.byteOffset,
    _vec2Buf.length
  );
  return new b2Vec2(result[0], result[1]);
};
b2Body.prototype.GetLocalVector = function (vec) {
  b2Body_GetLocalVector(this.ptr, vec.x, vec.y, _vec2Buf.byteOffset);
  var result = new Float32Array(
    _vec2Buf.buffer,
    _vec2Buf.byteOffset,
    _vec2Buf.length
  );
  return new b2Vec2(result[0], result[1]);
};
b2Body.prototype.GetPosition = function () {
  b2Body_GetPosition(this.ptr, _vec2Buf.byteOffset);
  var result = new Float32Array(
    _vec2Buf.buffer,
    _vec2Buf.byteOffset,
    _vec2Buf.length
  );
  return new b2Vec2(result[0], result[1]);
};
b2Body.prototype.GetTransform = function () {
  var transform = new b2Transform();
  transform.p.x = this.buffer.getFloat32(b2Body_xf_offset, true);
  transform.p.y = this.buffer.getFloat32(b2Body_xf_offset + 4, true);
  transform.q.s = this.buffer.getFloat32(b2Body_xf_offset + 8, true);
  transform.q.c = this.buffer.getFloat32(b2Body_xf_offset + 12, true);
  return transform;
};
b2Body.prototype.GetType = function () {
  return b2Body_GetType(this.ptr);
};
b2Body.prototype.GetUserData = function () {
  return this.buffer.getUint32(b2Body_userData_offset, true);
};
b2Body.prototype.GetWorldCenter = function () {
  b2Body_GetWorldCenter(this.ptr, _vec2Buf.byteOffset);
  var result = new Float32Array(
    _vec2Buf.buffer,
    _vec2Buf.byteOffset,
    _vec2Buf.length
  );
  return new b2Vec2(result[0], result[1]);
};
b2Body.prototype.GetWorldPoint = function (vec) {
  b2Body_GetWorldPoint(this.ptr, vec.x, vec.y, _vec2Buf.byteOffset);
  var result = new Float32Array(
    _vec2Buf.buffer,
    _vec2Buf.byteOffset,
    _vec2Buf.length
  );
  return new b2Vec2(result[0], result[1]);
};
b2Body.prototype.GetWorldVector = function (vec) {
  b2Body_GetWorldVector(this.ptr, vec.x, vec.y, _vec2Buf.byteOffset);
  var result = new Float32Array(
    _vec2Buf.buffer,
    _vec2Buf.byteOffset,
    _vec2Buf.length
  );
  return new b2Vec2(result[0], result[1]);
};
b2Body.prototype.SetAngularVelocity = function (angle) {
  b2Body_SetAngularVelocity(this.ptr, angle);
};
b2Body.prototype.SetAwake = function (flag) {
  b2Body_SetAwake(this.ptr, flag);
};
b2Body.prototype.SetFixedRotation = function (flag) {
  b2Body_SetFixedRotation(this.ptr, flag);
};
b2Body.prototype.SetLinearVelocity = function (v) {
  b2Body_SetLinearVelocity(this.ptr, v.x, v.y);
};
b2Body.prototype.SetMassData = function (massData) {
  b2Body_SetMassData(
    this.ptr,
    massData.mass,
    massData.center.x,
    massData.center.y,
    massData.I
  );
};
b2Body.prototype.SetTransform = function (v, angle) {
  b2Body_SetTransform(this.ptr, v.x, v.y, angle);
};
b2Body.prototype.SetType = function (type) {
  b2Body_SetType(this.ptr, type);
};
b2Body.prototype.SetGravityScale = function (scale) {
  b2Body_SetGravityScale(this.ptr, scale);
};
b2Body.prototype.GetGravityScale = function () {
  return b2Body_GetGravityScale(this.ptr);
};
var b2_staticBody = 0;
var b2_kinematicBody = 1;
var b2_dynamicBody = 2;
function b2BodyDef() {
  this.active = true;
  this.allowSleep = true;
  this.angle = 0;
  this.angularVelocity = 0;
  this.angularDamping = 0;
  this.awake = true;
  this.bullet = false;
  this.fixedRotation = false;
  this.gravityScale = 1;
  this.linearDamping = 0;
  this.linearVelocity = new b2Vec2();
  this.position = new b2Vec2();
  this.type = b2_staticBody;
  this.userData = null;
}
b2World.BeginContactBody = function (contactPtr) {
  if (world.listener.BeginContactBody === undefined) return;
  var contact = new b2Contact(contactPtr);
  world.listener.BeginContactBody(contact);
};
b2World.EndContactBody = function (contactPtr) {
  if (world.listener.EndContactBody === undefined) return;
  var contact = new b2Contact(contactPtr);
  world.listener.EndContactBody(contact);
};
b2World.PreSolve = function (contactPtr, oldManifoldPtr) {
  if (world.listener.PreSolve === undefined) return;
  world.listener.PreSolve(
    new b2Contact(contactPtr),
    new b2Manifold(oldManifoldPtr)
  );
};
b2World.PostSolve = function (contactPtr, impulsePtr) {
  if (world.listener.PostSolve === undefined) return;
  world.listener.PostSolve(
    new b2Contact(contactPtr),
    new b2ContactImpulse(impulsePtr)
  );
};
b2World.QueryAABB = function (fixturePtr) {
  return world.queryAABBCallback.ReportFixture(
    world.fixturesLookup[fixturePtr]
  );
};
b2World.RayCast = function (
  fixturePtr,
  pointX,
  pointY,
  normalX,
  normalY,
  fraction
) {
  return world.rayCastCallback.ReportFixture(
    world.fixturesLookup[fixturePtr],
    new b2Vec2(pointX, pointY),
    new b2Vec2(normalX, normalY),
    fraction
  );
};
var b2World_Create = Module.cwrap("b2World_Create", "number", [
  "number",
  "number",
]);
var b2World_CreateBody = Module.cwrap("b2World_CreateBody", "number", [
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
]);
var b2World_CreateParticleSystem = Module.cwrap(
  "b2World_CreateParticleSystem",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2World_DestroyBody = Module.cwrap("b2World_DestroyBody", "null", [
  "number",
  "number",
]);
var b2World_DestroyJoint = Module.cwrap("b2World_DestroyJoint", "null", [
  "number",
  "number",
]);
var b2World_DestroyParticleSystem = Module.cwrap(
  "b2World_DestroyParticleSystem",
  "null",
  ["number", "number"]
);
var b2World_QueryAABB = Module.cwrap("b2World_QueryAABB", "null", [
  "number",
  "number",
  "number",
  "number",
  "number",
]);
var b2World_RayCast = Module.cwrap("b2World_RayCast", "null", [
  "number",
  "number",
  "number",
  "number",
  "number",
]);
var b2World_SetContactListener = Module.cwrap(
  "b2World_SetContactListener",
  "null",
  ["number"]
);
var b2World_SetGravity = Module.cwrap("b2World_SetGravity", "null", [
  "number",
  "number",
  "number",
]);
var b2World_Step = Module.cwrap("b2World_Step", "null", [
  "number",
  "number",
  "number",
]);
var _transBuf = null;
var _vec2Buf = null;
function b2World(gravity) {
  this.bodies = [];
  this.bodiesLookup = {};
  this.fixturesLookup = {};
  this.joints = [];
  this.listener = null;
  this.particleSystems = [];
  this.ptr = b2World_Create(gravity.x, gravity.y);
  this.queryAABBCallback = null;
  this.rayCastCallback = null;
  this.buffer = new DataView(Module.HEAPU8.buffer, this.ptr);
  var nDataBytes = 4 * Float32Array.BYTES_PER_ELEMENT;
  var dataPtr = Module._malloc(nDataBytes);
  _transBuf = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
  nDataBytes = 2 * Float32Array.BYTES_PER_ELEMENT;
  dataPtr = Module._malloc(nDataBytes);
  _vec2Buf = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
}
b2World._Push = function (item, list) {
  item.lindex = list.length;
  list.push(item);
};
b2World._RemoveItem = function (item, list) {
  var length = list.length;
  var lindex = item.lindex;
  if (length > 1) {
    list[lindex] = list[length - 1];
    list[lindex].lindex = lindex;
  }
  list.pop();
};
b2World.prototype.CreateBody = function (bodyDef) {
  var body = new b2Body(
    b2World_CreateBody(
      this.ptr,
      bodyDef.active,
      bodyDef.allowSleep,
      bodyDef.angle,
      bodyDef.angularVelocity,
      bodyDef.angularDamping,
      bodyDef.awake,
      bodyDef.bullet,
      bodyDef.fixedRotation,
      bodyDef.gravityScale,
      bodyDef.linearDamping,
      bodyDef.linearVelocity.x,
      bodyDef.linearVelocity.y,
      bodyDef.position.x,
      bodyDef.position.y,
      bodyDef.type,
      bodyDef.userData
    )
  );
  b2World._Push(body, this.bodies);
  this.bodiesLookup[body.ptr] = body;
  return body;
};
b2World.prototype.CreateJoint = function (jointDef) {
  var joint = jointDef.Create(this);
  b2World._Push(joint, this.joints);
  return joint;
};
b2World.prototype.CreateParticleSystem = function (psd) {
  var ps = new b2ParticleSystem(
    b2World_CreateParticleSystem(
      this.ptr,
      psd.colorMixingStrength,
      psd.dampingStrength,
      psd.destroyByAge,
      psd.ejectionStrength,
      psd.elasticStrength,
      psd.lifetimeGranularity,
      psd.powderStrength,
      psd.pressureStrength,
      psd.radius,
      psd.repulsiveStrength,
      psd.springStrength,
      psd.staticPressureIterations,
      psd.staticPressureRelaxation,
      psd.staticPressureStrength,
      psd.surfaceTensionNormalStrength,
      psd.surfaceTensionPressureStrength,
      psd.viscousStrength
    )
  );
  b2World._Push(ps, this.particleSystems);
  ps.dampingStrength = psd.dampingStrength;
  ps.radius = psd.radius;
  return ps;
};
b2World.prototype.DestroyBody = function (body) {
  b2World_DestroyBody(this.ptr, body.ptr);
  b2World._RemoveItem(body, this.bodies);
};
b2World.prototype.DestroyJoint = function (joint) {
  b2World_DestroyJoint(this.ptr, joint.ptr);
  b2World._RemoveItem(joint, this.joints);
};
b2World.prototype.DestroyParticleSystem = function (particleSystem) {
  b2World_DestroyParticleSystem(this.ptr, particleSystem.ptr);
  b2World._RemoveItem(particleSystem, this.particleSystems);
};
b2World.prototype.QueryAABB = function (callback, aabb) {
  this.queryAABBCallback = callback;
  b2World_QueryAABB(
    this.ptr,
    aabb.lowerBound.x,
    aabb.lowerBound.y,
    aabb.upperBound.x,
    aabb.upperBound.y
  );
};
b2World.prototype.RayCast = function (callback, point1, point2) {
  this.rayCastCallback = callback;
  b2World_RayCast(this.ptr, point1.x, point1.y, point2.x, point2.y);
};
b2World.prototype.SetContactListener = function (listener) {
  this.listener = listener;
  b2World_SetContactListener(this.ptr);
};
b2World.prototype.SetGravity = function (gravity) {
  b2World_SetGravity(this.ptr, gravity.x, gravity.y);
};
b2World.prototype.Step = function (steps, vIterations, pIterations) {
  b2World_Step(this.ptr, steps, vIterations, pIterations);
};
var b2WheelJoint_SetMotorSpeed = Module.cwrap(
  "b2WheelJoint_SetMotorSpeed",
  "null",
  ["number", "number"]
);
var b2WheelJoint_SetSpringFrequencyHz = Module.cwrap(
  "b2WheelJoint_SetSpringFrequencyHz",
  "null",
  ["number", "number"]
);
function b2WheelJoint(def) {
  this.next = null;
  this.ptr = null;
}
b2WheelJoint.prototype.SetMotorSpeed = function (speed) {
  b2WheelJoint_SetMotorSpeed(this.ptr, speed);
};
b2WheelJoint.prototype.SetSpringFrequencyHz = function (hz) {
  b2WheelJoint_SetSpringFrequencyHz(this.ptr, hz);
};
var b2WheelJointDef_Create = Module.cwrap("b2WheelJointDef_Create", "number", [
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
]);
var b2WheelJointDef_InitializeAndCreate = Module.cwrap(
  "b2WheelJointDef_InitializeAndCreate",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
function b2WheelJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
  this.dampingRatio = 0.7;
  this.enableMotor = false;
  this.frequencyHz = 2;
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.localAxisA = new b2Vec2(1, 0);
  this.maxMotorTorque = 0;
  this.motorSpeed = 0;
}
b2WheelJointDef.prototype.Create = function (world) {
  var wheelJoint = new b2WheelJoint(this);
  wheelJoint.ptr = b2WheelJointDef_Create(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    this.collideConnected,
    this.dampingRatio,
    this.enableMotor,
    this.frequencyHz,
    this.localAnchorA.x,
    this.localAnchorA.y,
    this.localAnchorB.x,
    this.localAnchorB.y,
    this.localAxisA.x,
    this.localAxisA.y,
    this.maxMotorTorque,
    this.motorSpeed
  );
  return wheelJoint;
};
b2WheelJointDef.prototype.InitializeAndCreate = function (
  bodyA,
  bodyB,
  anchor,
  axis
) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  var wheelJoint = new b2WheelJoint(this);
  wheelJoint.ptr = b2WheelJointDef_InitializeAndCreate(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    anchor.x,
    anchor.y,
    axis.x,
    axis.y,
    this.collideConnected,
    this.dampingRatio,
    this.enableMotor,
    this.frequencyHz,
    this.maxMotorTorque,
    this.motorSpeed
  );
  b2World._Push(wheelJoint, world.joints);
  return wheelJoint;
};
var b2WeldJointDef_Create = Module.cwrap("b2WeldJointDef_Create", "number", [
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
]);
var b2WeldJointDef_InitializeAndCreate = Module.cwrap(
  "b2WeldJointDef_InitializeAndCreate",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
function b2WeldJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
  this.dampingRatio = 0;
  this.frequencyHz = 0;
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.referenceAngle = 0;
}
b2WeldJointDef.prototype.Create = function (world) {
  var weldJoint = new b2WeldJoint(this);
  weldJoint.ptr = b2WeldJointDef_Create(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    this.collideConnected,
    this.dampingRatio,
    this.frequencyHz,
    this.localAnchorA.x,
    this.localAnchorA.y,
    this.localAnchorB.x,
    this.localAnchorB.y,
    this.referenceAngle
  );
  return weldJoint;
};
b2WeldJointDef.prototype.InitializeAndCreate = function (bodyA, bodyB, anchor) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  var weldJoint = new b2WeldJoint(this);
  weldJoint.ptr = b2WeldJointDef_InitializeAndCreate(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    anchor.x,
    anchor.y,
    this.collideConnected,
    this.dampingRatio,
    this.frequencyHz
  );
  b2World._Push(weldJoint, world.joints);
  return weldJoint;
};
function b2WeldJoint(def) {
  this.bodyA = def.bodyA;
  this.bodyB = def.bodyB;
  this.next = null;
  this.ptr = null;
}
var b2GearJoint_GetRatio = Module.cwrap("b2GearJoint_GetRatio", "number", [
  "number",
]);
function b2GearJoint(def) {
  this.ptr = null;
  this.next = null;
}
b2GearJoint.prototype.GetRatio = function () {
  return b2GearJoint_GetRatio(this.ptr);
};
var b2GearJointDef_Create = Module.cwrap("b2GearJointDef_Create", "number", [
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
]);
function b2GearJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
  this.joint1 = null;
  this.joint2 = null;
  this.ratio = 0;
}
b2GearJointDef.prototype.Create = function (world) {
  var gearJoint = new b2GearJoint(this);
  gearJoint.ptr = b2GearJointDef_Create(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    this.collideConnected,
    this.joint1.ptr,
    this.joint2.ptr,
    this.ratio
  );
  return gearJoint;
};
var e_unknownJoint = 0;
var e_revoluteJoint = 1;
var e_prismaticJoint = 2;
var e_distanceJoint = 3;
var e_pulleyJoint = 4;
var e_mouseJoint = 5;
var e_gearJoint = 6;
var e_wheelJoint = 7;
var e_weldJoint = 8;
var e_frictionJoint = 9;
var e_ropeJoint = 10;
var e_motorJoint = 11;
var b2Joint_GetBodyA = Module.cwrap("b2Joint_GetBodyA", "number", ["number"]);
var b2Joint_GetBodyB = Module.cwrap("b2Joint_GetBodyB", "number", ["number"]);
function b2Joint() {}
b2Joint.prototype.GetBodyA = function () {
  return world.bodiesLookup[b2Joint_GetBodyA(this.ptr)];
};
b2Joint.prototype.GetBodyB = function () {
  return world.bodiesLookup[b2Joint_GetBodyB(this.ptr)];
};
var b2FrictionJointDef_Create = Module.cwrap(
  "b2FrictionJointDef_Create",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2FrictionJointDef_InitializeAndCreate = Module.cwrap(
  "b2FrictionJointDef_InitializeAndCreate",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
function b2FrictionJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.maxForce = 0;
  this.maxTorque = 0;
  this.userData = null;
}
b2FrictionJointDef.prototype.Create = function (world) {
  var frictionJoint = new b2FrictionJoint(this);
  frictionJoint.ptr = b2FrictionJointDef_Create(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    this.collideConnected,
    this.localAnchorA.x,
    this.localAnchorA.y,
    this.localAnchorB.x,
    this.localAnchorB.y,
    this.maxForce,
    this.maxTorque
  );
  return frictionJoint;
};
b2FrictionJointDef.prototype.InitializeAndCreate = function (
  bodyA,
  bodyB,
  anchor
) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  var frictionJoint = new b2FrictionJoint(this);
  frictionJoint.ptr = b2FrictionJointDef_InitializeAndCreate(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    anchor.x,
    anchor.y,
    this.collideConnected,
    this.maxForce,
    this.maxTorque
  );
  b2World._Push(frictionJoint, world.joints);
  return frictionJoint;
};
function b2FrictionJoint(def) {
  this.bodyA = def.bodyA;
  this.bodyB = def.bodyB;
  this.ptr = null;
  this.next = null;
}
var b2RevoluteJoint_EnableLimit = Module.cwrap(
  "b2RevoluteJoint_EnableLimit",
  "number",
  ["number", "number"]
);
var b2RevoluteJoint_EnableMotor = Module.cwrap(
  "b2RevoluteJoint_EnableMotor",
  "number",
  ["number", "number"]
);
var b2RevoluteJoint_GetJointAngle = Module.cwrap(
  "b2RevoluteJoint_GetJointAngle",
  "number",
  ["number"]
);
var b2RevoluteJoint_IsLimitEnabled = Module.cwrap(
  "b2RevoluteJoint_IsLimitEnabled",
  "number",
  ["number"]
);
var b2RevoluteJoint_IsMotorEnabled = Module.cwrap(
  "b2RevoluteJoint_IsMotorEnabled",
  "number",
  ["number"]
);
var b2RevoluteJoint_SetMotorSpeed = Module.cwrap(
  "b2RevoluteJoint_SetMotorSpeed",
  "number",
  ["number", "number"]
);
function b2RevoluteJoint(revoluteJointDef) {
  this.collideConnected = revoluteJointDef.collideConnected;
  this.enableLimit = revoluteJointDef.enableLimit;
  this.enableMotor = revoluteJointDef.enableMotor;
  this.lowerAngle = revoluteJointDef.lowerAngle;
  this.maxMotorTorque = revoluteJointDef.maxMotorTorque;
  this.motorSpeed = revoluteJointDef.motorSpeed;
  this.next = null;
  this.ptr = null;
  this.upperAngle = revoluteJointDef.upperAngle;
  this.userData = revoluteJointDef.userData;
}
b2RevoluteJoint.prototype = new b2Joint();
b2RevoluteJoint.prototype.EnableLimit = function (flag) {
  b2RevoluteJoint_EnableLimit(this.ptr, flag);
};
b2RevoluteJoint.prototype.EnableMotor = function (flag) {
  b2RevoluteJoint_EnableMotor(this.ptr, flag);
};
b2RevoluteJoint.prototype.GetJointAngle = function (flag) {
  return b2RevoluteJoint_GetJointAngle(this.ptr);
};
b2RevoluteJoint.prototype.IsLimitEnabled = function () {
  return b2RevoluteJoint_IsLimitEnabled(this.ptr);
};
b2RevoluteJoint.prototype.IsMotorEnabled = function () {
  return b2RevoluteJoint_IsMotorEnabled(this.ptr);
};
b2RevoluteJoint.prototype.SetMotorSpeed = function (speed) {
  b2RevoluteJoint_SetMotorSpeed(this.ptr, speed);
  this.motorSpeed = speed;
};
var b2RevoluteJointDef_Create = Module.cwrap(
  "b2RevoluteJointDef_Create",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2RevoluteJointDef_InitializeAndCreate = Module.cwrap(
  "b2RevoluteJointDef_InitializeAndCreate",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
function b2RevoluteJointDef() {
  this.collideConnected = false;
  this.enableLimit = false;
  this.enableMotor = false;
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.lowerAngle = 0;
  this.maxMotorTorque = 0;
  this.motorSpeed = 0;
  this.referenceAngle = 0;
  this.upperAngle = 0;
  this.userData = null;
}
b2RevoluteJointDef.prototype.Create = function (world) {
  var revoluteJoint = new b2RevoluteJoint(this);
  revoluteJoint.ptr = b2RevoluteJointDef_Create(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    this.collideConnected,
    this.enableLimit,
    this.enableMotor,
    this.lowerAngle,
    this.localAnchorA.x,
    this.localAnchorA.y,
    this.localAnchorB.x,
    this.localAnchorB.y,
    this.maxMotorTorque,
    this.motorSpeed,
    this.referenceAngle,
    this.upperAngle
  );
  return revoluteJoint;
};
b2RevoluteJointDef.prototype.InitializeAndCreate = function (
  bodyA,
  bodyB,
  anchor
) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  var revoluteJoint = new b2RevoluteJoint(this);
  revoluteJoint.ptr = b2RevoluteJointDef_InitializeAndCreate(
    world.ptr,
    bodyA.ptr,
    bodyB.ptr,
    anchor.x,
    anchor.y,
    this.collideConnected,
    this.enableLimit,
    this.enableMotor,
    this.lowerAngle,
    this.maxMotorTorque,
    this.motorSpeed,
    this.upperAngle
  );
  b2World._Push(revoluteJoint, world.joints);
  return revoluteJoint;
};
var b2MotorJoint_SetAngularOffset = Module.cwrap(
  "b2MotorJoint_SetAngularOffset",
  "null",
  ["number", "number"]
);
var b2MotorJoint_SetLinearOffset = Module.cwrap(
  "b2MotorJoint_SetLinearOffset",
  "null",
  ["number", "number", "number"]
);
function b2MotorJoint(def) {
  this.bodyA = def.bodyA;
  this.bodyB = def.bodyB;
  this.ptr = null;
  this.next = null;
}
b2MotorJoint.prototype.SetAngularOffset = function (angle) {
  b2MotorJoint_SetAngularOffset(this.ptr, angle);
};
b2MotorJoint.prototype.SetLinearOffset = function (v) {
  b2MotorJoint_SetLinearOffset(this.ptr, v.x, v.y);
};
var b2MotorJointDef_Create = Module.cwrap("b2MotorJointDef_Create", "number", [
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
]);
var b2MotorJointDef_InitializeAndCreate = Module.cwrap(
  "b2MotorJointDef_InitializeAndCreate",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
function b2MotorJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
  this.angularOffset = 0;
  this.correctionFactor = 0.3;
  this.linearOffset = new b2Vec2();
  this.maxForce = 0;
  this.maxTorque = 0;
}
b2MotorJointDef.prototype.Create = function (world) {
  var motorJoint = new b2MotorJoint(this);
  motorJoint.ptr = b2MotorJointDef_Create(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    this.collideConnected,
    this.angularOffset,
    this.correctionFactor,
    this.linearOffset.x,
    this.linearOffset.y,
    this.maxForce,
    this.maxTorque
  );
  return motorJoint;
};
b2MotorJointDef.prototype.InitializeAndCreate = function (bodyA, bodyB) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  var motorJoint = new b2MotorJoint(this);
  motorJoint.ptr = b2MotorJointDef_InitializeAndCreate(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    this.collideConnected,
    this.correctionFactor,
    this.maxForce,
    this.maxTorque
  );
  b2World._Push(motorJoint, world.joints);
  return motorJoint;
};
function b2PulleyJoint(def) {
  this.ptr = null;
  this.next = null;
}
var b2PulleyJointDef_Create = Module.cwrap(
  "b2PulleyJointDef_Create",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2PulleyJointDef_InitializeAndCreate = Module.cwrap(
  "b2PulleyJointDef_InitializeAndCreate",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
function b2PulleyJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = true;
  this.groundAnchorA = new b2Vec2();
  this.groundAnchorB = new b2Vec2();
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.lengthA = 0;
  this.lengthB = 0;
  this.ratio = 1;
}
b2PulleyJointDef.prototype.Create = function (world) {
  var pulleyJoint = new b2PulleyJoint(this);
  pulleyJoint.ptr = b2PulleyJointDef_Create(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    this.collideConnected,
    this.groundAnchorA.x,
    this.groundAnchorA.y,
    this.groundAnchorB.x,
    this.groundAnchorB.y,
    this.lengthA,
    this.lengthB,
    this.localAnchorA.x,
    this.localAnchorA.y,
    this.localAnchorB.x,
    this.localAnchorB.y,
    this.ratio
  );
  return pulleyJoint;
};
b2PulleyJointDef.prototype.InitializeAndCreate = function (
  bodyA,
  bodyB,
  groundAnchorA,
  groundAnchorB,
  anchorA,
  anchorB,
  ratio
) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  var pulleyJoint = new b2PulleyJoint(this);
  pulleyJoint.ptr = b2PulleyJointDef_InitializeAndCreate(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    anchorA.x,
    anchorA.y,
    anchorB.x,
    anchorB.y,
    groundAnchorA.x,
    groundAnchorA.y,
    groundAnchorB.x,
    groundAnchorB.y,
    ratio,
    this.collideConnected
  );
  b2World._Push(pulleyJoint, world.joints);
  return pulleyJoint;
};
function b2DistanceJoint(def) {
  this.bodyA = def.bodyA;
  this.bodyB = def.bodyB;
  this.ptr = null;
  this.next = null;
}
var b2DistanceJointDef_Create = Module.cwrap(
  "b2DistanceJointDef_Create",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2DistanceJointDef_InitializeAndCreate = Module.cwrap(
  "b2DistanceJointDef_InitializeAndCreate",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
function b2DistanceJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
  this.dampingRatio = 0;
  this.length = 1;
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.frequencyHz = 0;
}
b2DistanceJointDef.prototype.Create = function (world) {
  var distanceJoint = new b2DistanceJoint(this);
  distanceJoint.ptr = b2DistanceJointDef_Create(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    this.collideConnected,
    this.dampingRatio,
    this.frequencyHz,
    this.length,
    this.localAnchorA.x,
    this.localAnchorA.y,
    this.localAnchorB.x,
    this.localAnchorB.y
  );
  return distanceJoint;
};
b2DistanceJointDef.prototype.InitializeAndCreate = function (
  bodyA,
  bodyB,
  anchorA,
  anchorB
) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  var distanceJoint = new b2DistanceJoint(this);
  distanceJoint.ptr = b2DistanceJointDef_InitializeAndCreate(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    anchorA.x,
    anchorA.y,
    anchorB.x,
    anchorB.y,
    this.collideConnected,
    this.dampingRatio,
    this.frequencyHz
  );
  b2World._Push(distanceJoint, world.joints);
  return distanceJoint;
};
var b2PrismaticJoint_EnableLimit = Module.cwrap(
  "b2PrismaticJoint_EnableLimit",
  "number",
  ["number", "number"]
);
var b2PrismaticJoint_EnableMotor = Module.cwrap(
  "b2PrismaticJoint_EnableMotor",
  "number",
  ["number", "number"]
);
var b2PrismaticJoint_GetJointTranslation = Module.cwrap(
  "b2PrismaticJoint_GetJointTranslation",
  "number",
  ["number"]
);
var b2PrismaticJoint_GetMotorSpeed = Module.cwrap(
  "b2PrismaticJoint_GetMotorSpeed",
  "number",
  ["number"]
);
var b2PrismaticJoint_GetMotorForce = Module.cwrap(
  "b2PrismaticJoint_GetMotorForce",
  "number",
  ["number", "number"]
);
var b2PrismaticJoint_IsLimitEnabled = Module.cwrap(
  "b2PrismaticJoint_IsLimitEnabled",
  "number",
  ["number"]
);
var b2PrismaticJoint_IsMotorEnabled = Module.cwrap(
  "b2PrismaticJoint_IsMotorEnabled",
  "number",
  ["number"]
);
var b2PrismaticJoint_SetMotorSpeed = Module.cwrap(
  "b2PrismaticJoint_SetMotorSpeed",
  "number",
  ["number", "number"]
);
function b2PrismaticJoint(def) {
  this.ptr = null;
  this.next = null;
}
b2PrismaticJoint.prototype = new b2Joint();
b2PrismaticJoint.prototype.EnableLimit = function (flag) {
  return b2PrismaticJoint_EnableLimit(this.ptr, flag);
};
b2PrismaticJoint.prototype.EnableMotor = function (flag) {
  return b2PrismaticJoint_EnableMotor(this.ptr, flag);
};
b2PrismaticJoint.prototype.GetJointTranslation = function () {
  return b2PrismaticJoint_GetJointTranslation(this.ptr);
};
b2PrismaticJoint.prototype.GetMotorSpeed = function () {
  return b2PrismaticJoint_GetMotorSpeed(this.ptr);
};
b2PrismaticJoint.prototype.GetMotorForce = function (hz) {
  return b2PrismaticJoint_GetMotorForce(this.ptr, hz);
};
b2PrismaticJoint.prototype.IsLimitEnabled = function () {
  return b2PrismaticJoint_IsLimitEnabled(this.ptr);
};
b2PrismaticJoint.prototype.IsMotorEnabled = function () {
  return b2PrismaticJoint_IsMotorEnabled(this.ptr);
};
b2PrismaticJoint.prototype.GetMotorEnabled = function () {
  return b2PrismaticJoint_IsMotorEnabled(this.ptr);
};
b2PrismaticJoint.prototype.SetMotorSpeed = function (speed) {
  return b2PrismaticJoint_SetMotorSpeed(this.ptr, speed);
};
var b2PrismaticJointDef_Create = Module.cwrap(
  "b2PrismaticJointDef_Create",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2PrismaticJointDef_InitializeAndCreate = Module.cwrap(
  "b2PrismaticJointDef_InitializeAndCreate",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
function b2PrismaticJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
  this.enableLimit = false;
  this.enableMotor = false;
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.localAxisA = new b2Vec2(1, 0);
  this.lowerTranslation = 0;
  this.maxMotorForce = 0;
  this.motorSpeed = 0;
  this.referenceAngle = 0;
  this.upperTranslation = 0;
}
b2PrismaticJointDef.prototype.Create = function (world) {
  var prismaticJoint = new b2PrismaticJoint(this);
  prismaticJoint.ptr = b2PrismaticJointDef_Create(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    this.collideConnected,
    this.enableLimit,
    this.enableMotor,
    this.localAnchorA.x,
    this.localAnchorA.y,
    this.localAnchorB.x,
    this.localAnchorB.y,
    this.localAxisA.x,
    this.localAxisA.y,
    this.lowerTranslation,
    this.maxMotorForce,
    this.motorSpeed,
    this.referenceAngle,
    this.upperTranslation
  );
  return prismaticJoint;
};
b2PrismaticJointDef.prototype.InitializeAndCreate = function (
  bodyA,
  bodyB,
  anchor,
  axis
) {
  this.bodyA = bodyA;
  this.bodyB = bodyB;
  var prismaticJoint = new b2PrismaticJoint(this);
  prismaticJoint.ptr = b2PrismaticJointDef_InitializeAndCreate(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    anchor.x,
    anchor.y,
    axis.x,
    axis.y,
    this.collideConnected,
    this.enableLimit,
    this.enableMotor,
    this.lowerTranslation,
    this.maxMotorForce,
    this.motorSpeed,
    this.upperTranslation
  );
  b2World._Push(prismaticJoint, world.joints);
  return prismaticJoint;
};
function b2RopeJoint(def) {
  this.next = null;
  this.ptr = null;
}
var b2RopeJointDef_Create = Module.cwrap("b2RopeJointDef_Create", "number", [
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
]);
function b2RopeJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
  this.localAnchorA = new b2Vec2();
  this.localAnchorB = new b2Vec2();
  this.maxLength = 0;
}
b2RopeJointDef.prototype.Create = function (world) {
  var ropeJoint = new b2RopeJoint(this);
  ropeJoint.ptr = b2RopeJointDef_Create(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    this.collideConnected,
    this.localAnchorA.x,
    this.localAnchorA.y,
    this.localAnchorB.x,
    this.localAnchorB.y,
    this.maxLength
  );
  return ropeJoint;
};
var b2MouseJoint_SetTarget = Module.cwrap("b2MouseJoint_SetTarget", "null", [
  "number",
  "number",
  "number",
]);
function b2MouseJoint(def) {
  this.ptr = null;
  this.next = null;
}
b2MouseJoint.prototype.SetTarget = function (p) {
  b2MouseJoint_SetTarget(this.ptr, p.x, p.y);
};
var b2MouseJointDef_Create = Module.cwrap("b2MouseJointDef_Create", "number", [
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
  "number",
]);
function b2MouseJointDef() {
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false;
  this.dampingRatio = 0.7;
  this.frequencyHz = 5;
  this.maxForce = 0;
  this.target = new b2Vec2();
}
b2MouseJointDef.prototype.Create = function (world) {
  var mouseJoint = new b2MouseJoint(this);
  mouseJoint.ptr = b2MouseJointDef_Create(
    world.ptr,
    this.bodyA.ptr,
    this.bodyB.ptr,
    this.collideConnected,
    this.dampingRatio,
    this.frequencyHz,
    this.maxForce,
    this.target.x,
    this.target.y
  );
  return mouseJoint;
};
var b2Contact_flags_offset = Offsets.b2Contact.flags;
var b2Contact_fixtureA_offset = Offsets.b2Contact.fixtureA;
var b2Contact_fixtureB_offset = Offsets.b2Contact.fixtureB;
var b2Contact_tangentSpeed_offset = Offsets.b2Contact.tangentSpeed;
var e_enabledFlag = 4;
var b2Contact_GetManifold = Module.cwrap("b2Contact_GetManifold", "number", [
  "number",
]);
var b2Contact_GetWorldManifold = Module.cwrap(
  "b2Contact_GetWorldManifold",
  "number",
  ["number"]
);
function b2Contact(ptr) {
  this.buffer = new DataView(Module.HEAPU8.buffer, ptr);
  this.ptr = ptr;
}
b2Contact.prototype.GetFixtureA = function () {
  var fixAPtr = this.buffer.getUint32(b2Contact_fixtureA_offset, true);
  return world.fixturesLookup[fixAPtr];
};
b2Contact.prototype.GetFixtureB = function () {
  var fixBPtr = this.buffer.getUint32(b2Contact_fixtureB_offset, true);
  return world.fixturesLookup[fixBPtr];
};
b2Contact.prototype.GetManifold = function () {
  return new b2Manifold(b2Contact_GetManifold(this.ptr));
};
b2Contact.prototype.GetWorldManifold = function () {
  return new b2WorldManifold(b2Contact_GetWorldManifold(this.ptr));
};
b2Contact.prototype.SetTangentSpeed = function (speed) {
  this.buffer.setFloat32(b2Contact_tangentSpeed_offset, speed, true);
};
b2Contact.prototype.SetEnabled = function (enable) {
  var flags = this.buffer.getUint32(b2Contact_flags_offset, true);
  if (enable) flags = flags | e_enabledFlag;
  else flags = flags & ~e_enabledFlag;
  this.buffer.setUint32(b2Contact_flags_offset, flags, true);
};
b2Contact.prototype.IsEnabled = function () {
  var flags = this.buffer.getUint32(b2Contact_flags_offset, true);
  return flags & e_enabledFlag;
};
function b2Filter() {
  this.categoryBits = 1;
  this.maskBits = 65535;
  this.groupIndex = 0;
}
var b2Fixture_isSensor_offset = Offsets.b2Fixture.isSensor;
var b2Fixture_userData_offset = Offsets.b2Fixture.userData;
var b2Fixture_filter_categoryBits_offset = Offsets.b2Fixture.filterCategoryBits;
var b2Fixture_filter_maskBits_offset = Offsets.b2Fixture.filterMaskBits;
var b2Fixture_filter_groupIndex_offset = Offsets.b2Fixture.filterGroupIndex;
function b2Fixture() {
  this.body = null;
  this.buffer = null;
  this.ptr = null;
  this.shape = null;
}
var b2Fixture_TestPoint = Module.cwrap("b2Fixture_TestPoint", "number", [
  "number",
  "number",
  "number",
]);
var b2Fixture_Refilter = Module.cwrap("b2Fixture_Refilter", "null", ["number"]);
b2Fixture.prototype._SetPtr = function (ptr) {
  this.ptr = ptr;
  this.buffer = new DataView(Module.HEAPU8.buffer, ptr);
};
b2Fixture.prototype.FromFixtureDef = function (fixtureDef) {
  this.density = fixtureDef.density;
  this.friction = fixtureDef.friction;
  this.isSensor = fixtureDef.isSensor;
  this.restitution = fixtureDef.restitution;
  this.shape = fixtureDef.shape;
  this.userData = fixtureDef.userData;
  this.vertices = [];
};
b2Fixture.prototype.GetUserData = function () {
  return this.buffer.getUint32(b2Fixture_userData_offset, true);
};
b2Fixture.prototype.SetFilterData = function (filter) {
  this.buffer.setUint16(
    b2Fixture_filter_categoryBits_offset,
    filter.categoryBits,
    true
  );
  this.buffer.setUint16(
    b2Fixture_filter_maskBits_offset,
    filter.maskBits,
    true
  );
  this.buffer.setUint16(
    b2Fixture_filter_groupIndex_offset,
    filter.groupIndex,
    true
  );
  this.Refilter();
};
b2Fixture.prototype.SetSensor = function (flag) {
  this.buffer.setUint32(b2Fixture_isSensor_offset, flag, true);
};
b2Fixture.prototype.Refilter = function () {
  b2Fixture_Refilter(this.ptr);
};
b2Fixture.prototype.TestPoint = function (p) {
  return b2Fixture_TestPoint(this.ptr, p.x, p.y);
};
function b2FixtureDef() {
  this.density = 0;
  this.friction = 0.2;
  this.isSensor = false;
  this.restitution = 0;
  this.shape = null;
  this.userData = null;
  this.filter = new b2Filter();
}
function b2ContactImpulse(ptr) {
  this.ptr = ptr;
  this.buffer = new DataView(Module.HEAPU8.buffer, ptr);
}
b2ContactImpulse.prototype.GetNormalImpulse = function (i) {
  return this.buffer.getFloat32(i * 4, true);
};
b2ContactImpulse.prototype.GetTangentImpulse = function (i) {
  return this.buffer.getFloat32(i * 4 + 8, true);
};
b2ContactImpulse.prototype.GetCount = function (i) {
  console.log(this.buffer.getInt32(16, true));
};
function b2ParticleSystemDef() {
  this.colorMixingStrength = 0.5;
  this.dampingStrength = 1;
  this.destroyByAge = true;
  this.ejectionStrength = 0.5;
  this.elasticStrength = 0.25;
  this.lifetimeGranularity = 1 / 60;
  this.powderStrength = 0.5;
  this.pressureStrength = 0.05;
  this.radius = 1;
  this.repulsiveStrength = 1;
  this.springStrength = 0.25;
  this.staticPressureIterations = 8;
  this.staticPressureRelaxation = 0.2;
  this.staticPressureStrength = 0.2;
  this.surfaceTensionNormalStrength = 0.2;
  this.surfaceTensionPressureStrength = 0.2;
  this.viscousStrength = 0.25;
}
var b2ParticleSystem_CreateParticle = Module.cwrap(
  "b2ParticleSystem_CreateParticle",
  "number",
  [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]
);
var b2ParticleSystem_GetColorBuffer = Module.cwrap(
  "b2ParticleSystem_GetColorBuffer",
  "number",
  ["number"]
);
var b2ParticleSystem_GetWeightBuffer = Module.cwrap(
  "b2ParticleSystem_GetWeightBuffer",
  "number",
  ["number"]
);
var b2ParticleSystem_GetParticleCount = Module.cwrap(
  "b2ParticleSystem_GetParticleCount",
  "number",
  ["number"]
);
var b2ParticleSystem_GetParticleLifetime = Module.cwrap(
  "b2ParticleSystem_GetParticleLifetime",
  "number",
  ["number", "number"]
);
var b2ParticleSystem_GetPositionBuffer = Module.cwrap(
  "b2ParticleSystem_GetPositionBuffer",
  "number",
  ["number"]
);
var b2ParticleSystem_GetVelocityBuffer = Module.cwrap(
  "b2ParticleSystem_GetVelocityBuffer",
  "number",
  ["number"]
);
var b2ParticleSystem_SetDamping = Module.cwrap(
  "b2ParticleSystem_SetDamping",
  "null",
  ["number", "number"]
);
var b2ParticleSystem_SetDensity = Module.cwrap(
  "b2ParticleSystem_SetDensity",
  "null",
  ["number", "number"]
);
var b2ParticleSystem_SetGravityScale = Module.cwrap(
  "b2ParticleSystem_SetGravityScale",
  "null",
  ["number", "number"]
);
var b2ParticleSystem_SetMaxParticleCount = Module.cwrap(
  "b2ParticleSystem_SetMaxParticleCount",
  "null",
  ["number", "number"]
);
var b2ParticleSystem_SetParticleLifetime = Module.cwrap(
  "b2ParticleSystem_SetParticleLifetime",
  "null",
  ["number", "number", "number"]
);
var b2ParticleSystem_SetRadius = Module.cwrap(
  "b2ParticleSystem_SetRadius",
  "null",
  ["number", "number"]
);
function b2ParticleSystem(ptr) {
  this.dampingStrength = 1;
  this.density = 1;
  this.ptr = ptr;
  this.particleGroups = [];
  this.radius = 1;
  this.gravityScale = 1;
}
b2ParticleSystem.prototype.CreateParticle = function (pd) {
  return b2ParticleSystem_CreateParticle(
    this.ptr,
    pd.color.r,
    pd.color.g,
    pd.color.b,
    pd.color.a,
    pd.flags,
    pd.group,
    pd.lifetime,
    pd.position.x,
    pd.position.y,
    pd.userData,
    pd.velocity.x,
    pd.velocity.y
  );
};
b2ParticleSystem.prototype.CreateParticleGroup = function (pgd) {
  var particleGroup = new b2ParticleGroup(
    pgd.shape._CreateParticleGroup(this, pgd)
  );
  this.particleGroups.push(particleGroup);
  return particleGroup;
};
b2ParticleSystem.prototype.DestroyParticlesInShape = function (shape, xf) {
  return shape._DestroyParticlesInShape(this, xf);
};
b2ParticleSystem.prototype.GetColorBuffer = function () {
  var count = b2ParticleSystem_GetParticleCount(this.ptr) * 4;
  var offset = b2ParticleSystem_GetColorBuffer(this.ptr);
  return new Uint8Array(Module.HEAPU8.buffer, offset, count);
};
b2ParticleSystem.prototype.GetWeightBuffer = function () {
  var count = b2ParticleSystem_GetParticleCount(this.ptr);
  var offset = b2ParticleSystem_GetWeightBuffer(this.ptr);
  return new Float32Array(Module.HEAPU8.buffer, offset, count);
};
b2ParticleSystem.prototype.GetParticleLifetime = function (index) {
  return b2ParticleSystem_GetParticleLifetime(this.ptr, index);
};
b2ParticleSystem.prototype.GetParticleCount = function () {
  return b2ParticleSystem_GetParticleCount(this.ptr);
};
b2ParticleSystem.prototype.GetPositionBuffer = function () {
  var count = b2ParticleSystem_GetParticleCount(this.ptr) * 2;
  var offset = b2ParticleSystem_GetPositionBuffer(this.ptr);
  return new Float32Array(Module.HEAPU8.buffer, offset, count);
};
b2ParticleSystem.prototype.GetVelocityBuffer = function () {
  var count = b2ParticleSystem_GetParticleCount(this.ptr) * 2;
  var offset = b2ParticleSystem_GetVelocityBuffer(this.ptr);
  return new Float32Array(Module.HEAPU8.buffer, offset, count);
};
b2ParticleSystem.prototype.SetDamping = function (damping) {
  this.dampingStrength = damping;
  b2ParticleSystem_SetDamping(this.ptr, damping);
};
b2ParticleSystem.prototype.SetDensity = function (density) {
  this.density = density;
  b2ParticleSystem_SetDensity(this.ptr, density);
};
b2ParticleSystem.prototype.SetGravityScale = function (gravityScale) {
  this.gravityScale = gravityScale;
  b2ParticleSystem_SetGravityScale(this.ptr, gravityScale);
};
b2ParticleSystem.prototype.SetMaxParticleCount = function (count) {
  b2ParticleSystem_SetMaxParticleCount(this.ptr, count);
};
b2ParticleSystem.prototype.SetParticleLifetime = function (index, lifetime) {
  b2ParticleSystem_SetParticleLifetime(this.ptr, index, lifetime);
};
b2ParticleSystem.prototype.SetRadius = function (radius) {
  this.radius = radius;
  b2ParticleSystem_SetRadius(this.ptr, radius);
};
var b2_solidParticleGroup = 1 << 0;
var b2_rigidParticleGroup = 1 << 1;
var b2_particleGroupCanBeEmpty = 1 << 2;
var b2_particleGroupWillBeDestroyed = 1 << 3;
var b2_particleGroupNeedsUpdateDepth = 1 << 4;
var b2_particleGroupInternalMask =
  b2_particleGroupWillBeDestroyed | b2_particleGroupNeedsUpdateDepth;
var b2ParticleGroup_ApplyForce = Module.cwrap(
  "b2ParticleGroup_ApplyForce",
  "null",
  ["number", "number", "number"]
);
var b2ParticleGroup_ApplyLinearImpulse = Module.cwrap(
  "b2ParticleGroup_ApplyLinearImpulse",
  "null",
  ["number", "number", "number"]
);
var b2ParticleGroup_DestroyParticles = Module.cwrap(
  "b2ParticleGroup_DestroyParticles",
  "null",
  ["number", "number"]
);
var b2ParticleGroup_GetBufferIndex = Module.cwrap(
  "b2ParticleGroup_GetBufferIndex",
  "number",
  ["number"]
);
var b2ParticleGroup_GetParticleCount = Module.cwrap(
  "b2ParticleGroup_GetParticleCount",
  "number",
  ["number"]
);
var b2ParticleGroup_groupFlags_offset = Offsets.b2ParticleGroup.groupFlags;
function b2ParticleGroup(ptr) {
  this.buffer = new DataView(Module.HEAPU8.buffer, ptr);
  this.ptr = ptr;
}
b2ParticleGroup.prototype.ApplyForce = function (force) {
  b2ParticleGroup_ApplyForce(this.ptr, force.x, force.y);
};
b2ParticleGroup.prototype.ApplyLinearImpulse = function (impulse) {
  b2ParticleGroup_ApplyLinearImpulse(this.ptr, impulse.x, impulse.y);
};
b2ParticleGroup.prototype.DestroyParticles = function (flag) {
  b2ParticleGroup_DestroyParticles(this.ptr, flag);
};
b2ParticleGroup.prototype.GetBufferIndex = function () {
  return b2ParticleGroup_GetBufferIndex(this.ptr);
};
b2ParticleGroup.prototype.GetGroupFlags = function () {
  return this.buffer.getUint32(b2ParticleGroup_groupFlags_offset, true);
};
b2ParticleGroup.prototype.GetParticleCount = function () {
  return b2ParticleGroup_GetParticleCount(this.ptr);
};
b2ParticleGroup.prototype.SetGroupFlags = function (flags) {
  this.buffer.setUint32(b2ParticleGroup_groupFlags_offset, flags, true);
};
function b2ParticleGroupDef() {
  this.angle = 0;
  this.angularVelocity = 0;
  this.color = new b2ParticleColor(0, 0, 0, 0);
  this.flags = 0;
  this.group = new b2ParticleGroup(null);
  this.groupFlags = 0;
  this.lifetime = 0;
  this.linearVelocity = new b2Vec2();
  this.position = new b2Vec2();
  this.positionData = null;
  this.particleCount = 0;
  this.shape = null;
  this.strength = 1;
  this.stride = 0;
  this.userData = null;
}
var b2_waterParticle = 0;
var b2_zombieParticle = 1 << 1;
var b2_wallParticle = 1 << 2;
var b2_springParticle = 1 << 3;
var b2_elasticParticle = 1 << 4;
var b2_viscousParticle = 1 << 5;
var b2_powderParticle = 1 << 6;
var b2_tensileParticle = 1 << 7;
var b2_colorMixingParticle = 1 << 8;
var b2_destructionListenerParticle = 1 << 9;
var b2_barrierParticle = 1 << 10;
var b2_staticPressureParticle = 1 << 11;
var b2_reactiveParticle = 1 << 12;
var b2_repulsiveParticle = 1 << 13;
var b2_fixtureContactListenerParticle = 1 << 14;
var b2_particleContactListenerParticle = 1 << 15;
var b2_fixtureContactFilterParticle = 1 << 16;
var b2_particleContactFilterParticle = 1 << 17;
function b2ParticleColor(r, g, b, a) {
  if (r === undefined) r = 0;
  if (g === undefined) g = 0;
  if (b === undefined) b = 0;
  if (a === undefined) a = 0;
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
}
b2ParticleColor.prototype.Set = function (r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};
function b2ParticleDef() {
  this.color = new b2Vec2();
  this.flags = 0;
  this.group = 0;
  this.lifetime = 0;
  this.position = new b2Vec2();
  this.userData = 0;
  this.velocity = new b2Vec2();
}
