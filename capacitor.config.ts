const config = {
  appId: 'id.pangkalpinang.sejatimaps',
  appName: 'SEJATI MAPS',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Geolocation: {
      permissions: ['location', 'coarseLocation'],
    },
  },
};

export default config;
