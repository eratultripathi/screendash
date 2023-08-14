import React, { useRef, useEffect, useState } from 'react';
import Peer from 'simple-peer';
import html2canvas from "html2canvas";
import axios from "axios";

const App= () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  // const screenshotCanvasRef = useRef(null);
  // const [screenshots, setScreenshots] = useState([]);
  let localPeer;
  let remotePeer;

  const startScreenSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

      localPeer = new Peer({ initiator: true, stream });
      remotePeer = new Peer();

      localPeer.on('stream', (localStream) => {
        localVideoRef.current.srcObject = localStream;
      });

      remotePeer.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });

      localPeer.on('signal', (data) => {
        remotePeer.signal(data);
      });

      remotePeer.on('signal', (data) => {
        localPeer.signal(data);
      });
    } catch (error) {
      console.error('Error starting screen sharing:', error);
    }
  };



  function captureScreenshot () {
    html2canvas(document.querySelector("#save")).then(canvas => {
        canvas.toBlob(function (blob) {
            // window.saveAs(blob, 'my_image.jpg');
            // Get canvas contents as a data URL
            var imgAsDataURL = canvas.toDataURL("image/png");

            console.log(imgAsDataURL)

            const values = ({
              imgurl: `${imgAsDataURL}`,
              
            });

            // post the screenshot of local device 
            axios.post('https://backendapi-wk9m.onrender.com/api/screenshot/create', values).then(function (response) {

            
              console.log("dataresponse", response);
            }).catch(function (error) {
      
              console.log(error.response);
            });
            // Save image into localStorage
            try {

                localStorage.setItem("imageStorage", imgAsDataURL);
               
            }  
            catch (e) {
                console.log("Storage failed: " + e);
            }


        });
    }) 
}


  useEffect(() => {
    const interval = setInterval(captureScreenshot , 5000);

    return () => {
      clearInterval(interval);
      if (localPeer) {
        localPeer.destroy();
      }
      if (remotePeer) {
        remotePeer.destroy();
      }
    };
  }, []);

  return (
    <div>
      <button onClick={startScreenSharing}>Window Screen Sharing</button>
      <div>
      
        <video ref={localVideoRef} autoPlay playsInline muted />
      </div>
      <div>
        
        <video id='save'  ref={remoteVideoRef}  autoPlay  width="320" height="200"/>
      </div>

     
      {/* <div>
        <h3>Screenshots</h3>
        {screenshots.map((screenshot, index) => (
          <img key={index} src={screenshot} alt={`Screenshot ${index}`} />
        ))}
      </div>
      <canvas ref={screenshotCanvasRef} style={{ display: 'none' }} /> */}
    </div>
  );
};

export default App;
