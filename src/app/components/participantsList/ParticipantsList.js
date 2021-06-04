import { Accordion, Button, Col, Row } from "react-bootstrap";
import { ArrowClockwise } from "react-bootstrap-icons";
import LocalPeer from "../../factories/LocalPeer";
import { useEffect, useState } from "react";
import './ParticipantsList.scss';
import _ from "lodash";

const ParticipantsList = (props) => {
    const [myVideoStream, setMyVideoStream] = useState(props.myStream || []);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        setMyVideoStream(props.myStream);
    }, [props.myStream]);
    
    const update = () => {
        LocalPeer.Instance().refreshUsers().then((userList) => {
            setUsers(userList);
        });
    }

    useEffect(() => {
        if (props.onLoad) {
            props.onLoad.call(this, { update });
            users.length && update();
        }
    }, []);

    return(
        <div className='participants-list-inner-area'>
            <Accordion className='participants-list' defaultActiveKey="0">
                <Row className='participants-list-header'>
                    <Col className='no-padding' xs={11}>
                        <Accordion.Toggle as={Button} style={{width: '100%'}} variant="link" eventKey="0">
                            <span>Usuários ({users.length})</span>
                        </Accordion.Toggle>
                    </Col>
                    <Col className='no-padding' xs={1}>
                        <Button title='Atualizar' style={{width: '30px'}} onClick={(e) => { update() }} size="sm" variant="outline-primary"><ArrowClockwise /></Button>
                    </Col>
                </Row>
                <Accordion.Collapse eventKey="0">
                    <div className='accordion-body'>
                        {
                            users.map((metadata) => {
                                const { connected, username, me, id } = metadata;
                                return <div key={username} className={`user-row${me ? ' me' : ''}`}>
                                    <div title={username} className='username'>{username}{me ? ' (Eu)' : ''}</div>
                                    { !me ? 
                                        !connected ?
                                            <Button onClick={() => LocalPeer.Instance().connect(id) } className='extra-small-btn' size="sm">Conectar</Button> 
                                        :
                                            <Button onClick={() => LocalPeer.Instance().call(id, myVideoStream) } className='extra-small-btn' size="sm">Chamar</Button> 
                                    : undefined }
                                </div>
                            })
                        }
                    </div>
                </Accordion.Collapse>
            </Accordion>
            <Button size="sm" onClick={() => LocalPeer.Instance().callToAllUsers(myVideoStream) } variant="success">Ligar para todos da lista</Button>
        </div>
    );
}

export default ParticipantsList;