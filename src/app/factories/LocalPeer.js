import ToastService from "../services/ToastService";
import Peer from "peerjs";
import axios from "axios";

const host = '192.168.5.192';
let connectedPeers = [];
let peersList = [];
let peer = null;
let me = {};

const newLocalPeer = (username) => {
    let onRefreshUsers;
    let onRemoteConnected;
    let onRemoteCallAnswered;
    
    const localPeer = new Peer({
        path: '/server/videochat',
        secure: true,
        port: '5000',
        key: 'sas',
        host,
    });

    localPeer.on('error', (err) => {
        ToastService.showError(err.type);
    });

    const refreshUsers = () => {
        return new Promise((resolve, reject) => {
            axios.get(`https://${host}:5000/server/videochat/sas/peers`).then((data) => {
                if (data && data.data) {
                    peersList = data.data.map((peerId) => {
                        const connected = connectedPeers.find((remotePeer) => remotePeer.id === peerId);
                        const itsMe = me.id === peerId;

                        return {
                            me: itsMe,
                            connected,
                            id: peerId,
                            username: itsMe ? me.username : peerId
                        }
                    });

                    onRefreshUsers && onRefreshUsers(peersList);
                    resolve(peersList);
                } else reject([]);
            }, () => reject([]))
        });
    }

    const manageConnectedPeers = (id) => {
        if (!connectedPeers.find(p => p.id === id)) {
            connectedPeers.push({ id });
        }
    }

    const getMe = () => me;

    const connect = (id) => {
        const remotePeer = localPeer.connect(id, { metadata: { name: me.username } });
        remotePeer.on('open', () => {
            manageConnectedPeers(id);
            onRemoteConnected && onRemoteConnected.call(this, id);
        });
    }

    const call = (id, stream) => {
        const callresult = localPeer.call(id, stream, { metadata: { name: me.username } });
        callresult.on('stream', function (stream) {
            onRemoteCallAnswered && onRemoteCallAnswered.call(this, id, stream);
        });
    }

    const callToAllUsers = (stream) => {
        peersList.filter(peer => !peer.me).forEach(({ id }) => {
            call(id, stream);
        });
    }

    const onOpen = (fn) => {
        localPeer.on('open', (id) => {
            me = {
                username,
                id
            }
            fn.call(this, id);
        });
    }

    const onConnection = (fn) => {
        localPeer.on('connection', (connection) => {
            manageConnectedPeers(connection.peer);
            fn.call(this, connection);
        });
    }

    peer = {
        // Events
        onRemoteCallAnswered: (fn) => onRemoteCallAnswered = fn,
        onRemoteConnected: (fn) => onRemoteConnected = fn,
        onRefreshUsers: (fn) => onRefreshUsers = fn,
        onCall: (fn) => localPeer.on('call', fn),
        onConnection,
        onOpen,

        // Methods
        callToAllUsers,
        refreshUsers,
        connect,
        getMe,
        call,
    }

    return peer;
}

const LocalPeer = {
    Instance: (name) => peer != null ? peer : newLocalPeer(name)
}

export default LocalPeer;