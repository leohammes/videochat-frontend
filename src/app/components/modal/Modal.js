import { Button, Modal } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';

export default function DefaultModal(props) {

    const [modalVisibility, setModalVisibility] = useState(props.modalVisibility);

    useEffect(() => {
        setModalVisibility(props.modalVisibility);
    }, [props.modalVisibility]);

    return(
        <Modal className={props.className} show={modalVisibility} onHide={() => props.handleModalClose({ setModalVisibility }) }>
            <Modal.Header closeButton>
                <Modal.Title>{props.modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                { props.children }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => props.handleModalClose({ setModalVisibility }) }>{props.buttonTitle}</Button>
            </Modal.Footer>
        </Modal>
    );
}