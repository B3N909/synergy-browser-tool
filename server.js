module.exports = async () => {
    const express = require("express");
    const axios = require("axios");
    const jwt = require("jsonwebtoken");
    const querystring = require("querystring");
    const app = express();
    

    const REDIRECT_URI = "auth/redirect"
    const SERVER_ROOT_URI = "http://localhost:8080";
    const GOOGLE_CLIENT_ID = "457864600888-n008vrl99041cll0cbo289kse8p82au0.apps.googleusercontent.com";
    const GOOGLE_CLIENT_SECRET = "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";
    const JWT_SECRET = "shhhhh";
    const COOKIE_NAME = "auth_token";


    const getTokens = (
        code,
        clientId,
        clientSecret,
        redirectUri,
    ) => {
        /*
         * Uses the code to get tokens
         * that can be used to fetch the user's profile
         */
        const url = "https://oauth2.googleapis.com/token";
        const values = {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        };
      
        return axios
          .post(url, querystring.stringify(values), {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          })
          .then((res) => res.data)
          .catch((error) => {
            console.error(`Failed to fetch auth tokens`);
            throw new Error(error.message);
          });
      }

    const getGoogleAuthURL = () => {
        const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
        const options = {
          redirect_uri: `${SERVER_ROOT_URI}/${REDIRECT_URI}`,
          client_id: GOOGLE_CLIENT_ID,
          access_type: "offline",
          response_type: "code",
          prompt: "consent",
          scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
          ].join(" "),
        };
      
        return `${rootUrl}?${querystring.stringify(options)}`;
    }

    app.get(`/${REDIRECT_URI}`, async (req, res) => {
        const code = req.query.code;
      
        const { id_token, access_token } = await getTokens(
          code,
          GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET,
          `${SERVER_ROOT_URI}/${REDIRECT_URI}`,
        );
      
        // Fetch the user's profile with the access token and bearer
        const googleUser = await axios
          .get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
            {
              headers: {
                Authorization: `Bearer ${id_token}`,
              },
            }
          )
          .then((res) => res.data)
          .catch((error) => {
            console.error(`Failed to fetch user`);
            throw new Error(error.message);
          });
      
        const token = jwt.sign(googleUser, JWT_SECRET);
      
        res.cookie(COOKIE_NAME, token, {
          maxAge: 900000,
          httpOnly: true,
          secure: false,
        });
      
        res.status(200).send("<html><head><title>Success</title></head</html>");
      });

    app.get("/auth/google/url", (req, res) => {
        return res.redirect(getGoogleAuthURL());
      });

    app.get("/api/oauth_callback", (req, res) => {
        console.log(req.query);
        res.status(200).send("<html><head><title>Success</title></head</html>");
    });
    
    app.listen(8080, () => console.log("listening on http://localhost:8080"));    
}
