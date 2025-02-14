import { useRef, useEffect, useState } from 'react';

import './overlaygui.css';
import { InteractWithAI } from '../helpers/interact-with-ai';

interface OverlayGUIProps {
  ai: InteractWithAI;
  data?: number;
  show?: boolean;
}
function OverlayGUI(props: OverlayGUIProps) {
  const actionsRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, SetSidebarOpen] = useState<boolean>(false);
  if (!props?.show) {
    return null;
  }

  const handleClick = () => {
    actionsRef.current?.classList.toggle('show');
    SetSidebarOpen(!sidebarOpen);
  };

  const handleFunction = (action: string) => {
    props.ai.handleAction(action);
  };

  return (
    <div className="custom-gui">
      <div className="control">
        <button className='actions-menu' onClick={handleClick}>
          <svg aria-hidden="true"><use xlinkHref="#icon/actions_menu" fill="currentColor"></use></svg>
        </button>
        <div className="actions-container content" ref={actionsRef}>
          <div className="actions-list">
            {/* <div className="button-wrapper">
              <button onClick={() => handleFunction('stand_hind')}>
                <svg aria-hidden="true">
                  <use xlinkHref="#icon/stretch_white" fill="white"></use>
                </svg>
              </button>
              <span>Stand out</span>
            </div> */}
            <div className="button-wrapper">
              <button onClick={() => handleFunction('hand_stand')}>
                <svg aria-hidden="true">
                  <use xlinkHref="#icon/hand_stand_white" fill="white"></use>
                </svg>
              </button>
              <span>Hand stand</span>
            </div>
            <div className="button-wrapper">
              <button onClick={() => handleFunction('standby_pose')}>
                <svg aria-hidden="true">
                  <use xlinkHref="#icon/stand_white" fill="white"></use>
                </svg>
              </button>
              <span>Stand up</span>
            </div>
            <div className="button-wrapper">
              <button onClick={() => handleFunction('sit')}>
                <svg aria-hidden="true">
                  <use xlinkHref="#icon/sitDown_white" fill="white"></use>
                </svg>
              </button>
              <span>Sit down</span>
            </div>
            <div className="button-wrapper">
              <button onClick={() => handleFunction('dance')}>
                <svg aria-hidden="true">
                  <use xlinkHref="#icon/dance_white" fill="white"></use>
                </svg>
              </button>
              <span>Dance</span>
            </div>
            <div className="button-wrapper">
              <button onClick={() => handleFunction('jump')}>
                <svg aria-hidden="true">
                  <use xlinkHref="#icon/jump_forward" fill="white"></use>
                </svg>
              </button>
              <span>Jump forward</span>
            </div>
            <div className="button-wrapper">
              <button onClick={() => handleFunction('stand_down')}>
                <svg aria-hidden="true">
                  <use xlinkHref="#icon/pounce" fill="white"></use>
                </svg>
              </button>
              <span>Stand down</span>
            </div>
            <div className="button-wrapper">
              <button onClick={() => handleFunction('finger_heart')}>
                <svg aria-hidden="true">
                  <use xlinkHref="#icon/show_heart" fill="white"></use>
                </svg>
              </button>
              <span>Finger heart</span>
            </div>
            <div className="button-wrapper">
              <button onClick={() => handleFunction('hello')}>
                <svg aria-hidden="true">
                  <use xlinkHref="#icon/greet" fill="white"></use>
                </svg>
              </button>
              <span>Hello</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasFrame() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      contextRef.current = ctx;

      // Draw a placeholder image
      const placeholderImage = new Image();
      placeholderImage.src = 'assets/loader-thumb.jpg';
      placeholderImage.onload = () => {
        ctx.drawImage(placeholderImage, 0, 0, canvas.width, canvas.height);
      };
    } else {
      console.error('canvasRef is not attached to the DOM.');
    }
  }, []);

  // Function to update the canvas with a Uint8Array
  const updateCanvas = (uint8Array, width, height) => {
    const ctx = contextRef.current;
    if (!ctx) return;
    // Create ImageData from Uint8Array
    const imageData = new ImageData(new Uint8ClampedArray(uint8Array), width, height);
    // Clear the canvas and draw the new image data
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.putImageData(imageData, 0, 0);
  };

  // Expose the update function to the window
  window.updateCanvas = updateCanvas;

  // Function to update the canvas with a JPEG Uint8Array
  const updateCanvasWithJPEG = (jpegUint8Array) => {
    const ctx = contextRef.current;
    if (!ctx) return;

    // Convert Uint8Array to a Blob
    const blob = new Blob([jpegUint8Array], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);

    // Create an image element and set the source to the object URL
    const img = new Image();
    img.src = url;

    img.onload = () => {
      // Draw the image on the canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      // Revoke the object URL to free memory
      URL.revokeObjectURL(url);
    };

    img.onerror = (error) => {
      console.error('Error loading image:', error);
    };
  };

  // Expose the update function to the window
  window.updateCanvasWithJPEG = updateCanvasWithJPEG;

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <>
      <div className={`canvas-container ${isZoomed ? 'zoomed' : ''}`}>
        <canvas id="camera" ref={canvasRef} width="320" height="180" className="canvas" onClick={toggleZoom} />
      </div>

      {isZoomed && <div className="overlay" onClick={toggleZoom} />}

      <svg className="brand-logo" aria-hidden="true">
        <use xlinkHref="#HCLTech-logo" fill="white"></use>
      </svg>
    </>
  );
}

export { OverlayGUI, CanvasFrame };
