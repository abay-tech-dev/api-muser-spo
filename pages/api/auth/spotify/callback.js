import axios from "axios";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";

export default async function handler(req, res) {
  const code = req.query.code;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

  try {
    // 1. Récupère refresh_token
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri,
        client_id,
        client_secret,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token } = tokenRes.data;

    // 2. Récupère profil utilisateur Spotify
    const profileRes = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const spotifyId = profileRes.data.id;

    // 3. Connecte-toi à MongoDB et sauvegarde (ou mets à jour) l'utilisateur
    await dbConnect();
    await User.findOneAndUpdate(
      { spotifyId },
      { refresh_token, updated_at: new Date() },
      { upsert: true }
    );

    // 4. Redirige vers la home avec userId dans l'URL
    res.redirect(`/?userId=${spotifyId}`);
  } catch (err) {
    res.status(400).json({ error: "Callback failed", details: err.message });
  }
}
