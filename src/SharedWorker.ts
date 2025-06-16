import UniRender from "../unirender/UniRender";

let worker: SharedWorker;

const tryRegisterSharedWorker = async () => {
  try {
    worker = new SharedWorker('/sharedWorker.js')
    // worker.port.onmessage = (event) => {}
  } catch (error) {
    console.error(`Shared worker registration failed with ${error}`);
  }
}

// const openNewTab = (id: number) => {
//   if (!worker?.port) return
//   worker.port.postMessage({
//     action: 'openNewTab',
//     data: {
//       id
//     }
//   })
// }

// const reloadTab = (id: number) => {
//   if (!worker?.port) return
//   worker.port.postMessage({
//     action: 'reloadTab',
//     data: {
//       id
//     }
//   })
// }

// const closeTab = (id: number) => {
//   if (!worker?.port) return
//   worker.port.postMessage({
//     action: 'closeTab',
//     data: {
//       id
//     }
//   })
// }

const createEventStream = (uniRender: UniRender) => {
  if (!worker?.port) return
  worker.port.onmessage = (data) => uniRender.apply(data.data);
  worker.port.postMessage({
    action: 'createEventStream',
    data: {
      apiHost: uniRender.params.apiHost
    }
  })
}

const stopEventStream = () => {
  if (!worker?.port) return
  worker.port.postMessage({
    action: 'stopEventStream',
  })
}

export { tryRegisterSharedWorker, createEventStream, stopEventStream, openNewTab, reloadTab, closeTab }