module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/workout/main',
        permanent: true,
      },
    ];
  },
};
