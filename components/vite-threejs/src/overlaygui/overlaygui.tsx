import { MessageWriter } from "@foxglove/rosmsg2-serialization";
import { get_client } from "../Websocket";
import "./overlaygui.css";
import { parse } from "@foxglove/rosmsg";
import { useRef, useEffect, useState } from "react";

function sendTwistMessage() {
  const c = get_client();
  //debugger;
  const subscribedChannel = (window.getChannelData() || []).find(
    (e) => e.t === "/cmd_vel"
  );
  console.log(subscribedChannel);


  if (false && subscribedChannel) {
    const channel = subscribedChannel.channel;
    const messageDefinition = parse(channel.schema, { ros2: true });
    const writer = new MessageWriter(messageDefinition);
    const cmdVelMessage = {
      linear: {
        x: 1.0, // Move forward at 1 m/s
        y: 0.0,
        z: 0.0,
      },
      angular: {
        x: 0.0,
        y: 0.0,
        z: 0.5, // Rotate at 0.5 rad/s around z-axis
      },
    };
    const message = writer.writeMessage({ data: cmdVelMessage });
    const msg = c?.sendMessage(channel.id, message);
    console.log(msg);
  } else {
    const twistmessage = "MSG: geometry_msgs/Twist\n# This expresses velocity in free space broken into its linear and angular parts.\n\nVector3  linear\nVector3  angular\n\n================================================================================\nMSG: geometry_msgs/Vector3\n# This represents a vector in free space.\n\n# This is semantically different than a point.\n# A vector is always anchored at the origin.\n# When a transform is applied to a vector, only the rotational component is applied.\n\nfloat64 x\nfloat64 y\nfloat64 z\n"
const messageDefinition = parse(twistmessage, { ros2: true });

    const channelId = c.advertise({
      topic: "/cmd_vel",
      encoding: "json",
      schemaName: "geometry_msgs/Twist",
    });

    const writer = new MessageWriter(messageDefinition);
    const cmdVelMessage = {
      linear: {
        x: 1.0, // Move forward at 1 m/s
        y: 0.0,
        z: 0.0,
      },
      angular: {
        x: 0.0,
        y: 0.0,
        z: 0.5, // Rotate at 0.5 rad/s around z-axis
      },
    };
    const message = writer.writeMessage({ data: cmdVelMessage });
    const msg = c?.sendMessage(channelId, message);
    console.log(msg);
    // see message with: ros2 topic echo /cmd_vel

  }
}
function OverlayGUI(props) {
  const value = props?.data ?? -1;
  if (!props?.show) {
    return null;
  }

  const handleClick = () => {
    const event = new CustomEvent("hackathonGuiEvent", {
      detail: { message: "Hello from react...", asd: "bsd" },
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
    sendTwistMessage();
  };
  return (
    <div className="custom-gui">
      <div className="control">
        {/* {value} */}
        <button onClick={handleClick}>🎮</button>
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
        <canvas
          ref={canvasRef}
          width="320"
          height="180"
          className="canvas"
          onClick={toggleZoom}
        />
      </div>

      {isZoomed && (
        <div className="overlay" onClick={toggleZoom} />
      )}
    </>
  );
}

export { OverlayGUI, CanvasFrame };
