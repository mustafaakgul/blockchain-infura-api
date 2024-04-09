module.exports = {
    apiResult: function (status, message = "Error!", response = 200) {
        return {
            status,
            message: message,
            response
        }
    }
};