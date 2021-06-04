import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

const showError = (message) => {
    toast.error(message, {
        position: "top-center",
        hideProgressBar: false,
        progress: undefined,
        closeOnClick: true,
        pauseOnHover: true,
        autoClose: false,
        draggable: true,
    });
};

const showInfo = (message) => {
    toast.info(message, {
        position: "top-center",
        hideProgressBar: false,
        progress: undefined,
        closeOnClick: true,
        pauseOnHover: true,
        autoClose: false,
        draggable: true,
    });    
};

const showConfirmAlert = (title, message) => {
    return new Promise((resolve, reject) => {
        confirmAlert({
            title,
            message,
            buttons: [
            {
                label: 'Yes',
                onClick: () => resolve()
            },
            {
                label: 'No',
                onClick: () => reject()
            }
            ]
        }
      );
    })
}

const ToastService = {
    showError, showInfo, showConfirmAlert
};

export default ToastService;