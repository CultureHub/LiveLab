var xtend = Object.assign
var LiveLabOSC = require('./../lib/LiveLabOSC.js')

module.exports = oscModel

function oscModel (state, bus) {
  state.osc = xtend({
    remote: {},
    forwarding: {},
    local: {},
    enabled: false,
    addBroadcast: {
      visible: false,
      port: '',
      name: ''
    },
    configureForwarding: {
      visible: false,
      port: '',
      ip: 'localhost',
      oscId: null
    }
  }, state.osc)

// only activate osc channels if in desktop app
  if (typeof nw === 'object') {
  // osc channels
    state.osc.enabled = true
    var osc = new LiveLabOSC()

    bus.on('osc:removeLocalOscBroadcast', function (port) {
      osc.stopListening(port)
      delete state.osc.local[port]
      syncWithRemote(state.osc.local)
      bus.emit('render')
    })

    bus.on('osc:setLocalOscForward', function (opts) {
      // console.log(opts)
      // state.osc.remote[opts.id].port = opts.port
      // state.osc.remote[opts.id].ip = opts.ip
      state.osc.forwarding[opts.id] = {
        ip: opts.ip,
        port: opts.port
      }
      state.osc.configureForwarding.visible = false
      bus.emit('render')
    })

    // called when osc message received locally
    osc.on('received osc', function (opts) {
      state.osc.local[opts.port].message = opts.message
      // console.log(opts.m)
  //    var id = state.user.uuid + '' + opts.port
      var id = opts.port
      bus.emit('user:sendToAll', JSON.stringify({
        type: 'osc',
        message: opts.message,
        peer: state.user.uuid,
        id: id,
        name: state.osc.local[opts.port].name
      }))
      bus.emit('render')
    })

    bus.on('osc:updateRemoteOscInfo', function (data) {
      // console.log('REMOTE', data.peerId, data.osc)
      state.osc.remote[data.peerId] = data.osc
      bus.emit('render')
      // get port forwarding info for current channels in peer
    })

    bus.on('osc:processRemoteOsc', function (data) {
    //  console.log("processing", data)
      //  state.user.osc.remote[data.data.id] = xtend(data.data, state.user.osc.remote[data.data.id])
      if (state.osc.remote[data.data.peer]) {
        state.osc.remote[data.data.peer][data.data.id] = data.data
      } else {
        state.osc.remote[data.data.peer] = {}
        state.osc.remote[data.data.peer][data.data.id] = data.data
      }
      //  state.user.osc.remote[data.data.id].port = ''
      //  console.log("processing ", data.data.id, state.user.osc.remote)
      if (state.osc.forwarding[data.data.peer + data.data.id] && state.osc.forwarding[data.data.peer + data.data.id].port) {
        osc.sendOSC(data.data.message, state.osc.forwarding[data.data.peer + data.data.id].port, state.osc.forwarding[data.data.peer + data.data.id].ip)
      }
    })

    bus.on('osc:setOscForwardPort', function (port) {
      state.osc.configureForwarding.port = port
      bus.emit('render')
    })

    bus.on('osc:setOscForwardIp', function (ip) {
      state.osc.configureForwarding.ip = ip
      bus.emit('render')
    })

    bus.on('osc:doneConfiguringOsc', function () {
      state.osc.configureForwarding = {
        visible: false,
        id: '',
        port: ''
      }
      bus.emit('render')
    })

    bus.on('osc:closeAddOscBroadcast', function () {
      state.osc.addBroadcast = {
        visible: false,
        name: '',
        port: ''
      }
      bus.emit('render')
    })

    // Events related to OSC
    bus.on('osc:addOSC', function () {
      state.osc.addBroadcast.visible = true
      bus.emit('render')
    })

    bus.on('osc:setOSCBroadcastPort', function (val) {
      state.osc.addBroadcast.port = val
      bus.emit('render')
    })

    bus.on('osc:setOSCBroadcastName', function (val) {
      state.osc.addBroadcast.name = val
      bus.emit('render')
    })

    bus.on('osc:listenOnLocalPort', function () {
      osc.listenOnPort(state.osc.addBroadcast.port)
      state.osc.local[state.osc.addBroadcast.port] = {
        name: state.osc.addBroadcast.name,
        message: null
      }
      // to do: add error checking for if port is in use
      state.osc.addBroadcast.port = null
      state.osc.addBroadcast.name = null
      state.osc.addBroadcast.visible = false

      syncWithRemote(state.osc.local)
      bus.emit('render')
    })

    bus.on('osc:configureForwarding', function (remoteOscId) {
      state.osc.configureForwarding = {
        visible: true,
        id: remoteOscId,
        port: '',
        ip: 'localhost'
      }
      bus.emit('render')
    })
  }

  function syncWithRemote (info) {
    bus.emit('user:sendToAll', JSON.stringify(
      {
        type: 'updatePeerInfo',
        message: {
          osc: info
        }
      }
    ))
  }
}
