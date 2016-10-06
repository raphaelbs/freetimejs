module.exports = {
    allowCrossDomain: {
        url: null,
        http: 8080,
        https: 8443,
        getPort: function (isSecure) {
            if (isSecure) return this.https;
            return this.http;
        }
    },
    thisServer: {
        http: 4003,
        https: 4443
    }
};