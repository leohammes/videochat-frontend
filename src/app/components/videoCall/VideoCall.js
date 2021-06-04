import React, { useEffect, useRef, useState } from "react";
import ParticipantsList from "../participantsList/ParticipantsList";
import { Col, Container, Nav, Row } from "react-bootstrap";
import ToastService from "../../services/ToastService";
import LocalPeer from "../../factories/LocalPeer";
import DefaultModal from "../modal/Modal";
import "./VideoCall.scss";
import _ from 'lodash';

export const VideoCall = (props) => {
    const [modalVisibility, setModalVisibility] = useState(true);
    const [callInProgress, setCallInProgress] = useState();
    const [simplePeer, setSimplePeer] = useState();
    const [stream, setLocalStream] = useState();
    const [name, setName] = useState();
    
    const [connected, setConnected] = useState(false);
    const [users, setUsers] = useState([]);
    const [components] = useState({});
    
    const [remoteVideos] = useState({});

    const videoSelf = useRef({});

    useEffect(() => {
        if (!(name && !modalVisibility)) return;

        const localPeer = LocalPeer.Instance(name);

        // When you connect with PeerJSServer successfully - It is the first contact with the server
        localPeer.onOpen(() => {
            setConnected(true);
            if (components.participantsList) {
                updateUsers();
            }
        });

        // When refresh users action is called (from anywhere)
        localPeer.onRefreshUsers((updatedUsers) => {
            setUsers(updatedUsers.filter(u => !u.me));
        });

        // When you click on "connect" button of someone in your list
        localPeer.onRemoteConnected((id) => {
            updateUsers();
        });

        // When remote accepts your call
        localPeer.onRemoteCallAnswered((id, remoteStream) => {
            playRemoteVideo(id, remoteStream);
        })

        // When remote clicks on "connect" button representing you in its list
        localPeer.onConnection((connection) => {
            ToastService.showInfo(`"${connection.metadata.name}" conectou com você`);
            updateUsers();
        });

        // When remote clicks on "call" button representing you in its list
        localPeer.onCall((call) => {
            ToastService.showConfirmAlert(`"${call.metadata.name}" esta te ligando`, 'Existe um participante ligando para você, deseja atender?')
            .then(() => {
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                navigator.getUserMedia({video: true, audio: true}, (stream) => {
                    call.answer(stream); // Answer the call with an A/V stream.
                    call.on('stream', (remoteStream) => playRemoteVideo(call.peer, remoteStream));
                    call.on('close', () => updateUsers());
                });
            });
        });

        setSimplePeer(localPeer);
    }, [name, modalVisibility]);

    useEffect(() => {
        if (simplePeer) {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            navigator.getUserMedia({video: true, audio: true}, (localStream) => {
                setLocalStream(localStream);
                const video = videoSelf.current;
                video.srcObject = localStream;
                video.play();
            }, function(err) {
                console.log('Failed to get local stream' ,err);
            });
        }
    }, [simplePeer]);

    const playRemoteVideo = (id, remoteStream) => {
        const video = remoteVideos[id];
        video.srcObject = remoteStream;
        video.play();
        setCallInProgress(true);
    }

    const buildUsersVideos = (user) => {
        return (
            <div className="video-block" >
                <div className="video-block-header">
                    { user.username }
                </div>
                <video ref={(ref) => remoteVideos[user.id] = ref} />
            </div>
        );
    }

    const updateUsers = () => {
        components.participantsList.update();
    }

    const handleModalClose = () => {
        if (name == null || name === '') return;
        setModalVisibility(false);
    }

    const onModalNameKeyUp = (e) => {
        const ENTER = 13;
        if ([ENTER].includes(e.keyCode)) {
            handleModalClose()
        }
    }

    return (
        <Container className='video-call no-padding' style={{height: '100%'}} fluid>
            <DefaultModal className='name-modal' modalTitle='Informe seu nome' buttonTitle='Ok' modalVisibility={modalVisibility} handleModalClose={handleModalClose}>
                <input onKeyUp={onModalNameKeyUp} className='name-input' onChange={(evt) => setName(evt.target.value)} />
            </DefaultModal>
            <Container className={`${!connected ? 'hidden' : ''}`} fluid style={{height: '100%'}} >
                <Row style={{height: '100%'}}>
                    <Col xs={4} className='no-padding'>
                        <Nav className="flex-column participants-list-area">
                            <ParticipantsList 
                                myStream={stream}
                                onLoad={(api) => components.participantsList = api } />
                        </Nav>
                    </Col>
                    <Col xs={8}>
                        <Row className="videos-area">
                            <div className="video-block">
                                <div className="video-block-header">
                                    { name ? <span>{name} <b>(Eu)</b></span> : undefined }
                                </div>
                                <video muted ref={videoSelf} />
                            </div>
                            {
                                users.map((user) => buildUsersVideos(user))
                            }
                        </Row>
                    </Col>
                </Row>
            </Container>
        </Container>
    );
};