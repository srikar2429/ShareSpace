import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

const RemoteVideo = ({ stream, peerId }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, peerId]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        width: "30%",
        border: "2px solid green",
        borderRadius: "8px",
        backgroundColor: "black",
      }}
    />
  );
};

const VideoCall = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const localVideoRef = useRef(null);
  const localStream = useRef(null);
  const peerConnections = useRef({});
  const iceCandidateBuffer = useRef({});
  const [remoteStreams, setRemoteStreams] = useState({});

  const iceServers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  const stopLocalStream = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }
  };

  const leaveCall = () => {
    socket.emit("leave-video-room", { roomId: chatId });
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    stopLocalStream();
    setRemoteStreams({});
    navigate("/chat");
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(async (stream) => {
        localVideoRef.current.srcObject = stream;
        localStream.current = stream;

        socket.emit("join-video-room", { roomId: chatId, user });

        const createPeerConnection = (socketId) => {
          if (peerConnections.current[socketId])
            return peerConnections.current[socketId];

          const pc = new RTCPeerConnection(iceServers);
          peerConnections.current[socketId] = pc;

          localStream.current
            .getTracks()
            .forEach((track) => pc.addTrack(track, localStream.current));

          pc.ontrack = (event) => {
            const remoteStream =
              event.streams?.[0] ??
              new MediaStream(event.track ? [event.track] : []);
            setRemoteStreams((prev) => ({ ...prev, [socketId]: remoteStream }));
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice-candidate", {
                candidate: event.candidate,
                to: socketId,
                from: socket.id,
              });
            }
          };

          return pc;
        };

        socket.on("user-joined", async ({ socketId }) => {
          if (peerConnections.current[socketId]) return;
          const pc = createPeerConnection(socketId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { sdp: offer, to: socketId, from: socket.id });
        });

        socket.on("offer", async ({ sdp, from }) => {
          let pc = peerConnections.current[from] ?? createPeerConnection(from);
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));

          if (iceCandidateBuffer.current[from]) {
            for (const candidate of iceCandidateBuffer.current[from]) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            delete iceCandidateBuffer.current[from];
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { sdp: answer, to: from, from: socket.id });
        });

        socket.on("answer", async ({ sdp, from }) => {
          const pc = peerConnections.current[from];
          if (!pc) return;
          try {
            if (
              pc.signalingState === "have-local-offer" &&
              !pc.remoteDescription
            ) {
              await pc.setRemoteDescription(new RTCSessionDescription(sdp));
              if (iceCandidateBuffer.current[from]) {
                for (const candidate of iceCandidateBuffer.current[from]) {
                  await pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
                delete iceCandidateBuffer.current[from];
              }
            }
          } catch {}
        });

        socket.on("ice-candidate", async ({ candidate, from }) => {
          const pc = peerConnections.current[from];
          if (!pc || !candidate) return;
          if (!pc.remoteDescription) {
            iceCandidateBuffer.current[from] =
              iceCandidateBuffer.current[from] ?? [];
            iceCandidateBuffer.current[from].push(candidate);
          } else {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch {}
          }
        });

        socket.on("user-left", ({ socketId }) => {
          if (peerConnections.current[socketId]) {
            peerConnections.current[socketId].close();
            delete peerConnections.current[socketId];
            setRemoteStreams((prev) => {
              const copy = { ...prev };
              delete copy[socketId];
              return copy;
            });
          }
        });
      })
      .catch(() => {
        alert("Could not access camera.");
        navigate(-1);
      });

    return () => {
      leaveCall();
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");
    };
  }, [chatId, navigate, user]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "30%", border: "2px solid blue", borderRadius: "8px" }}
      />
      {Object.entries(remoteStreams).map(([peerId, stream]) => (
        <RemoteVideo key={peerId} stream={stream} peerId={peerId} />
      ))}
      <button
        onClick={leaveCall}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "8px",
          backgroundColor: "#d9534f",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Leave Call
      </button>
    </div>
  );
};

export default VideoCall;
