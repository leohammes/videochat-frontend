import { Container, Nav, Navbar } from 'react-bootstrap';
import { VideoCall } from './components/videoCall/VideoCall';
import ToastService from './services/ToastService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './App.css';

function App() {
  axios.interceptors.response.use((response) => response, (error) => {
    ToastService.showError('Ocorreu um erro ao requisitar o servidor');
  });

  return (
    <div style={{height:"100vh"}}>
      <ToastContainer />
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="#home">SAS Videochat</Navbar.Brand>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#about">Sobre</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Container className='util-area no-padding' fluid>
        <VideoCall/>
      </Container>
    </div>
  );
}

export default App;
