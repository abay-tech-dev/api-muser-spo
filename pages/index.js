import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [userId, setUserId] = useState(null);
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Récupère userId depuis l’URL après callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("userId");
    if (id) setUserId(id);
  }, []);

  // Auto-refresh toutes les 1 seconde
  useEffect(() => {
    if (!userId) return;
    const fetchTrack = async () => {
      setLoading(true);
      const res = await fetch(`/api/spotify/current?userId=${userId}`);
      const data = await res.json();
      setTrack(data);
      setLoading(false);
    };
    fetchTrack();
    intervalRef.current = setInterval(fetchTrack, 1000);
    return () => clearInterval(intervalRef.current);
  }, [userId]);

  // Animation audio bars façon Spotify
  const AudioBars = () => (
    <div style={{ display: 'flex', alignItems: 'end', height: 18, gap: 2, marginRight: 16 }}>
      {[8, 14, 10, 16, 9].map((h, i) => (
        <div key={i}
          style={{
            width: 4,
            height: h,
            background: "#1DB954",
            borderRadius: 2,
            animation: `wave 1s ${i * 0.12}s infinite cubic-bezier(.45,0,.55,1) alternate`
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          to { height: 20px }
        }
      `}</style>
    </div>
  );

  if (!userId) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#181818"
      }}>
        <a href="/api/auth/spotify/login">
          <button style={{
            padding: "1rem 2.5rem",
            borderRadius: 999,
            background: "#1DB954",
            color: "#fff",
            border: "none",
            fontWeight: 700,
            fontSize: "1.2rem",
            boxShadow: "0 2px 16px #1DB95422",
            cursor: "pointer"
          }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
              alt="Spotify logo" width={30} style={{ verticalAlign: "middle", marginRight: 14, filter: "invert(1)" }} />
            Connecter Spotify
          </button>
        </a>
      </div>
    );
  }

  // Barre widget compact, sans preview
  return (
    <div style={{
      width: "100%",
      maxWidth: 520,
      minWidth: 260,
      margin: "32px auto",
      background: "#181818dd",
      borderRadius: 24,
      boxShadow: "0 3px 28px #19141499",
      padding: "16px 28px 16px 18px",
      display: "flex",
      alignItems: "center",
      gap: 18,
      color: "#fff",
      fontFamily: "system-ui,sans-serif",
      position: "relative"
    }}>
      <AudioBars />
      {track?.item ? (
        <>
          <img
            src={track.item.album.images[0].url}
            alt="cover"
            width={56}
            height={56}
            style={{
              borderRadius: 10,
              boxShadow: "0 2px 10px #1DB95433, 0 1px 4px #0004",
              objectFit: "cover",
              flexShrink: 0
            }}
          />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{
              fontWeight: 700,
              fontSize: 17,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {track.item.name}
            </div>
            <div style={{
              color: "#1DB954",
              fontWeight: 600,
              fontSize: 15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {track.item.artists.map(a => a.name).join(', ')}
            </div>
            <div style={{
              color: "#aaa",
              fontSize: 14,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {track.item.album.name}
            </div>
          </div>
        </>
      ) : (
        <div style={{ color: "#ccc", fontStyle: "italic", flex: 1 }}>
          {loading ? "Chargement..." : "Aucune lecture détectée"}
        </div>
      )}
    </div>
  );
}
