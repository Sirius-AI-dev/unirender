const browserTabs = new Map()

const eventStream = {
  source: false,
  create: function(apiHost, esId) {
    if (this.source) return
    console.log('EventStream create')
    try {
      this.source = new EventSource(`${apiHost}/ub/es/subscribe?esId=${esId}`, { withCredentials: true });
      this.source.onmessage = (event) => {
        const data = JSON.parse(event.data)

        let allClients = []

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
    } catch (error) {
      console.error(error);
    }
  },
  close: function () {
    this.source.close();
    this.source = false;
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
        eventStream.create(event.data.apiHost, event.data.esId);
        break;

      case 'stopEventStream':
        eventStream.close();
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