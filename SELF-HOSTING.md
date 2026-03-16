# Self-Hosted Server Setup Guide

## Overview

This guide explains how to set up Core Climbing for self-hosted use on your local network. The current implementation uses local storage (AsyncStorage), but this guide provides options for setting up a simple server for home use.

## Quick Start: Local Network Access

### Option 1: Using Expo Dev Server (Simplest)

The easiest way to run Core Climbing on your local network is using Expo's development server:

1. **Start the server on your computer:**
   ```bash
   npm install
   npm start
   ```

2. **Access from other devices on the same network:**
   - Install Expo Go app on your mobile device
   - Scan the QR code displayed in the terminal
   - The app will run on your device, connecting to the development server

### Option 2: Building Standalone App (Recommended for Production)

For a standalone app that doesn't require the development server:

```bash
# For Android
expo build:apk

# For iOS (requires Mac with Xcode)
expo build:ios
```

Install the built app on your devices. Data will be stored locally on each device.

## Setting Up Data Sync (Future Enhancement)

To sync data across multiple devices on your local network, you can set up a simple backend server. Here are the recommended approaches:

### Option A: Firebase (Easiest Cloud Solution)

Firebase provides a free tier and works great for small-scale home use:

1. Create a Firebase project at https://firebase.google.com/
2. Install Firebase SDK:
   ```bash
   npm install firebase
   ```

3. Configure Firebase in your app (add to `src/config/firebase.ts`):
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-project-id",
     // ... other config
   };
   
   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   ```

4. Update StorageService to use Firestore instead of AsyncStorage

### Option B: Supabase (Open Source Alternative)

Supabase is an open-source Firebase alternative that you can self-host:

1. Sign up at https://supabase.com/ (or self-host using Docker)
2. Create a new project
3. Install Supabase client:
   ```bash
   npm install @supabase/supabase-js
   ```

4. Configure Supabase:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseKey = 'YOUR_SUPABASE_KEY';
   export const supabase = createClient(supabaseUrl, supabaseKey);
   ```

### Option C: Simple Node.js Server (Full Control)

For complete control, set up a simple Express.js server on your home network:

1. **Create a server directory:**
   ```bash
   mkdir core-climbing-server
   cd core-climbing-server
   npm init -y
   npm install express cors body-parser sqlite3
   ```

2. **Create server.js:**
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const bodyParser = require('body-parser');
   const sqlite3 = require('sqlite3').verbose();
   
   const app = express();
   const db = new sqlite3.Database('./climbing.db');
   
   app.use(cors());
   app.use(bodyParser.json());
   
   // Initialize database tables
   db.serialize(() => {
     db.run(`CREATE TABLE IF NOT EXISTS workouts (
       id TEXT PRIMARY KEY,
       user_id TEXT,
       name TEXT,
       date TEXT,
       data TEXT
     )`);
   });
   
   // API endpoints
   app.get('/api/workouts', (req, res) => {
     db.all('SELECT * FROM workouts', [], (err, rows) => {
       if (err) {
         res.status(500).json({ error: err.message });
         return;
       }
       res.json(rows);
     });
   });
   
   app.post('/api/workouts', (req, res) => {
     const { id, user_id, name, date, data } = req.body;
     db.run(
       'INSERT OR REPLACE INTO workouts VALUES (?, ?, ?, ?, ?)',
       [id, user_id, name, date, JSON.stringify(data)],
       (err) => {
         if (err) {
           res.status(500).json({ error: err.message });
           return;
         }
         res.json({ success: true });
       }
     );
   });
   
   const PORT = 3000;
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

3. **Start the server:**
   ```bash
   node server.js
   ```

4. **Find your local IP:**
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` or `ip addr show`

5. **Update the app to use your server:**
   Create `src/config/api.ts`:
   ```typescript
   export const API_URL = 'http://192.168.1.XXX:3000/api';
   ```

   Update StorageService to use fetch() instead of AsyncStorage.

## Network Configuration

### Making Your Server Accessible

1. **Find your computer's local IP address:**
   - It will be something like `192.168.1.100` or `10.0.0.50`

2. **Configure firewall:**
   - Allow incoming connections on the port your server uses (default: 3000)
   - Windows: Windows Defender Firewall → Advanced Settings
   - Mac: System Preferences → Security & Privacy → Firewall
   - Linux: `sudo ufw allow 3000`

3. **Connect devices to the same WiFi network**

4. **Access the app:**
   - Use `http://YOUR-LOCAL-IP:3000` as the server URL

## Data Backup

### Local Backup

For the current AsyncStorage implementation:

1. Use the "Export Data" feature in the Profile screen (future enhancement)
2. Or manually backup using:
   ```bash
   # On Android
   adb backup -f backup.ab com.yourapp
   
   # On iOS (requires jailbreak or development mode)
   # Use iTunes backup
   ```

### Server Backup

If using a self-hosted server:

```bash
# SQLite database
cp climbing.db climbing_backup_$(date +%Y%m%d).db

# Automate with cron (Linux/Mac)
0 2 * * * cp /path/to/climbing.db /path/to/backups/climbing_$(date +\%Y\%m\%d).db
```

## Security Considerations

For local network use:

1. **Use HTTPS** even on local network (self-signed certificate)
2. **Add authentication** - implement simple username/password
3. **Restrict access** to your local network only
4. **Regular backups** - automate database backups
5. **Keep updated** - regularly update dependencies

## Troubleshooting

### Can't connect to server

1. Check if server is running: `netstat -an | grep 3000`
2. Verify firewall allows connections
3. Ensure devices are on same network
4. Try accessing `http://YOUR-IP:3000` in a browser

### Data not syncing

1. Check server logs for errors
2. Verify API endpoint URLs are correct
3. Check network connectivity
4. Ensure AsyncStorage to server migration is complete

## Future Enhancements

Planned features for better self-hosted experience:

- [ ] Built-in data export/import
- [ ] Automatic server discovery on local network
- [ ] Offline-first sync (work offline, sync when online)
- [ ] Multi-user support with separate profiles
- [ ] Web interface for viewing progress on desktop
- [ ] Automated backup system

## Getting Help

For issues with self-hosting:

1. Check server logs
2. Verify network configuration
3. Test API endpoints with curl or Postman
4. Open an issue on GitHub with details

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Networking](https://reactnative.dev/docs/network)
- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
