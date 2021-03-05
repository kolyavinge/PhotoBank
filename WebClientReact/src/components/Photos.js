import React from 'react';
import Modal from 'react-modal';
import { useHistory } from 'react-router-dom';
import Axios from 'axios';
import SignalR from '../api/signalr';
import UploadPhotos from '../components/UploadPhoto'
import Utils from '../api/utils';
import Config from '../config';

const styles = {
    li: {
        display: 'inline-block'
    }
}

const confirmDeletePhotoModalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
    },
    content: {
        position: 'absolute',
        margin: 'auto',
        width: '450px',
        height: '120px',
        border: '1px solid #ccc',
        background: '#fff',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none'
    }
}

function Photos() {
    const login = localStorage.getItem('auth-data-login')
    const token = localStorage.getItem('auth-data-token')
    const clientId = localStorage.getItem('auth-data-clientId')
    const history = useHistory()
    const [photos, setPhotos] = React.useState([])
    const [selectedDeletePhotoId, setSelectedDeletePhotoId] = React.useState()
    const [isDeletePhotoConfirmOpen, setIsDeletePhotoConfirmOpen] = React.useState(false)

    function loadPhotosId() {
        Axios({
            method: 'post',
            url: Config.getPhotosApiPath,
            data: { login: login, token: token, clientId: clientId }
        })
    }
    
    function loadPhotosContent(photoIds) {
        for (let photoIdIndex in photoIds) {
            // получаем содержимое каждой фотки
            Axios({
                method: 'post',
                url: Config.getPhotoApiPath,
                data: { photoId: photoIds[photoIdIndex], login: login, token: token, clientId: clientId }
            })
        }
    }

    function confirmDeletePhoto(photoId) {
        setSelectedDeletePhotoId(photoId)
        setIsDeletePhotoConfirmOpen(true)
    }
    
    function deleteSelectedPhoto() {
        Axios({
            method: 'post',
            url: Config.deletePhotoApiPath,
            data: { photoId: selectedDeletePhotoId, login: login, token: token, clientId: clientId }
        })
    }

    function initSignalRResponses() {
        const signalr = new SignalR();
        signalr.addHandler('GetPhotosResponse', function (response) {
            if (!response || !response.success) {
                history.push('/');
            } else {
                loadPhotosContent(response.photoIds);
            }
        })
        signalr.addHandler('GetPhotoResponse', function (response) {
            if (!response || !response.success) {
                history.push('/');
            } else {
                const photo = { id: response.photoId, image: 'data:image/png;base64,' + response.fileBase64Content };
                setPhotos(photos => photos.concat(photo));
            }
        })
        signalr.addHandler('UploadPhotosResponse', function (response) {
            if (!response || !response.success) {
                history.push('/');
            } else {
                loadPhotosContent([response.photoId]);
            }
        })
        signalr.addHandler('DeletePhotoResponse', function (response) {
            if (!response || !response.success) {
                history.push('/');
            } else {
                setPhotos(photos => photos.filter(photo => photo.id !== response.photoId));
            }
        })
        signalr.start(clientId).then(() => loadPhotosId());
    }

    React.useEffect(() => { initSignalRResponses(); }, [])

    return (
        <div>
            <h1>Photos</h1>
            <UploadPhotos />
            {photos.length > 0 ?
                <ul>
                    {photos.map((photo, index) => {
                        return  <li key={index} style={styles.li}>
                                    <div>
                                        <img src={photo.image} width='200' />
                                        <a href='#' onClick={() => confirmDeletePhoto(photo.id)}><img src='/trash.png' /></a>
                                    </div>
                                </li>
                    })}
                </ul>
            :'нет фоток'}

            <Modal appElement={document.getElementById('root')}
                isOpen={isDeletePhotoConfirmOpen}
                onRequestClose={() => setIsDeletePhotoConfirmOpen(false)}
                shouldCloseOnOverlayClick={false}
                style={confirmDeletePhotoModalStyles}>
                <div>
                    <p>Вы действительно хотите удалить выбранную фотографию?</p>
                    <div style={{position: 'absolute', bottom: '16px', right: '16px'}}>
                        <button onClick={() => { deleteSelectedPhoto(); setIsDeletePhotoConfirmOpen(false) }} style={{width: '75px', height: '24px'}}>Да</button>
                        <button onClick={() => setIsDeletePhotoConfirmOpen(false)} style={{width: '75px', height: '24px', marginLeft: '8px'}}>Нет</button>
                    </div>
                </div>
            </Modal>
        </div >
    )
}

export default Photos;
