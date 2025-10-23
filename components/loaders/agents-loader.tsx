"use client";
import React from "react";

type LoaderProps = {
  /** Escala visual del loader respecto al tamaño base (148x100). */
  scale?: number; // default: 1
  /** Color de las bolitas. */
  dotColor?: string; // default: "#000"
  /** Duración del ciclo en segundos. */
  duration?: number; // default: 1.2
  /** Separación entre fases (en segundos) para los loaders 2 y 3. */
  phaseGap?: number; // default: 0.15
  /** Clase extra para estilizar el contenedor externo. */
  className?: string;
};

const AgentsLoader: React.FC<LoaderProps> = ({
  scale = 1,
  dotColor = "#D97757",
  duration = 1.2,
  phaseGap = 0.15,
  className = "",
}) => {
  const delay2 = `${phaseGap}s`;
  const delay3 = `${phaseGap * 2}s`;

  return (
    <div
      className={`loader-wrapper ${className}`}
      style={
        {
          // CSS Custom Props
          ["--scale" as any]: scale,
          ["--dotColor" as any]: dotColor,
          ["--duration" as any]: `${duration}s`,
        } as React.CSSProperties
      }
    >
      <div className="loader">
        <div className="roller" />
        <div className="roller" />
      </div>

      <div className="loader" style={{ ["--delay" as any]: delay2 }}>
        <div className="roller" />
        <div className="roller" />
      </div>

      <div className="loader" style={{ ["--delay" as any]: delay3 }}>
        <div className="roller" />
        <div className="roller" />
      </div>

      <style jsx>{`
        .loader-wrapper {
          /* Tamaño base del arte original */
          width: 148px;
          height: 100px;
          position: relative;
          display: inline-block;
          transform: scale(var(--scale));
          transform-origin: center;
          /* Quita si no quieres que "ocupe" el tamaño escalado físicamente */
          /* will-change: transform; */
        }

        .loader {
          width: 148px;
          height: 100px;
          position: absolute;
          top: 0;
          left: 0;
        }

        /* Sombra animada bajo el punto */
        .loader::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          height: 0.25em;
          width: 1em;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.9);
          opacity: 0.3;
          animation: shadow var(--duration) linear infinite;
          animation-delay: var(--delay, 0s);
        }

        .roller,
        .roller:last-child {
          width: 70px;
          height: 70px;
          position: absolute;
          top: 0;
          left: 0;
          transform: rotate(135deg);
          animation: rollercoaster var(--duration) linear infinite;
          animation-delay: var(--delay, 0s);
        }

        .roller:last-child {
          left: auto;
          right: 0;
          transform: rotate(-45deg);
          animation: rollercoaster2 var(--duration) linear infinite;
        }

        .roller::before {
          content: "";
          display: block;
          width: 15px;
          height: 15px;
          background: var(--dotColor);
          border-radius: 50%;
        }

        /* ===== Keyframes (no-prefixed) ===== */

        @keyframes rollercoaster {
          0% {
            transform: rotate(135deg);
          }
          8% {
            transform: rotate(240deg);
          }
          20% {
            transform: rotate(300deg);
          }
          40% {
            transform: rotate(380deg);
          }
          45% {
            transform: rotate(440deg);
          }
          50% {
            transform: rotate(495deg);
            opacity: 1;
          }
          50.1% {
            transform: rotate(495deg);
            opacity: 0;
          }
          100% {
            transform: rotate(495deg);
            opacity: 0;
          }
        }

        @keyframes rollercoaster2 {
          0% {
            opacity: 0;
          }
          49.9% {
            opacity: 0;
          }
          50% {
            opacity: 1;
            transform: rotate(-45deg);
          }
          58% {
            transform: rotate(-160deg);
          }
          70% {
            transform: rotate(-240deg);
          }
          80% {
            transform: rotate(-300deg);
          }
          90% {
            transform: rotate(-340deg);
          }
          100% {
            transform: rotate(-405deg);
          }
        }

        @keyframes shadow {
          0% {
            opacity: 0.3;
            transform: translateX(65px) scale(0.5, 0.5);
          }
          8% {
            transform: translateX(30px) scale(2, 2);
          }
          13% {
            transform: translateX(0px) scale(1.3, 1.3);
          }
          30% {
            transform: translateX(-15px) scale(0.5, 0.5);
            opacity: 0.1;
          }
          50% {
            transform: translateX(60px) scale(1.2, 1.2);
            opacity: 0.3;
          }
          60% {
            transform: translateX(130px) scale(2, 2);
            opacity: 0.05;
          }
          65% {
            transform: translateX(145px) scale(1.2, 1.2);
          }
          80% {
            transform: translateX(120px) scale(0.5, 0.5);
            opacity: 0.1;
          }
          90% {
            transform: translateX(80px) scale(0.8, 0.8);
          }
          100% {
            transform: translateX(60px);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

export default AgentsLoader;
