const browserTabs = new Map()
let eventStreamStatus = false;

const eventStream = {
  source: false,
  apiHost: false,
  esId: false,
  errorReconnectInterval: 5000,
  closeReconnectInterval: 2000,
  create: function() {

    if (this.source && this.source.readyState !== EventSource.CLOSED) {
      return
    }

    console.log('EventStream create')
    try {
      this.source = new EventSource(`${this.apiHost}/ub/es/subscribe?esId=${this.esId}`, { withCredentials: true });
    } catch (error) {
      console.error(error);
    }

    this.source.onmessage = (event) => {
      const data = JSON.parse(event.data)

      let allClients = [];

      if (data.tab_id) {
        allClients.push(browserTabs.get(data.tab_id))
      } else {
        allClients = [...browserTabs.values()]
      }

      Promise.all(
          allClients.map(port => {
            if (!port) return
            return port.postMessage(data)
          })
      )
    };

    this.source.onclose = (event) => {
      console.error('Close occurred:', event);
      if (eventStreamStatus) { // EventStream should be connected
        //eventStream.reconnect(this.closeReconnectInterval)
      }
    };

    this.source.onerror = (event) => {
      console.error('Error occurred:', event);
      if (eventStreamStatus) { // EventStream should be connected
        this.source.close();
        eventStream.reconnect(this.errorReconnectInterval)
      }
    }
  },
  close: function () {
    this.source.close();
  },
  reconnect: function(interval) {
    eventStream.create();
    setTimeout(function () {
      if (eventStream.source.readyState === EventSource.CLOSED) {
        eventStream.reconnect(interval)
      }
    }, interval);
  }
}

// Worker start
self.onconnect = (initEvent) => {
  console.log('Worker connect')
  // Handle message to worker
  initEvent.source.onmessage = (event) => {
    console.log('Worker receive event', event)
    switch (event.data.action) {
      case 'createEventStream':
        eventStreamStatus = true;
        eventStream.apiHost = event.data.apiHost;
        eventStream.esId = event.data.esId;
        eventStream.errorReconnectInterval = event.data.errorTimeout ?? eventStream.errorReconnectInterval;
        eventStream.closeReconnectInterval = event.data.closeTimeout ?? eventStream.closeReconnectInterval;
        eventStream.create();
        break;

      case 'stopEventStream':
        eventStreamStatus = false;
        eventStream.close();
        eventStream.source = false;
        break;

      case 'openNewTab':
      case 'reloadTab':
        browserTabs.set(event.data.data.id, event.srcElement);
        break;

      case 'closeTab':
        for (key of browserTabs.keys()) {
          if (browserTabs.get(key) === event.srcElement) {
            browserTabs.delete(key)
          }
        }
        break;
    }
  }
}