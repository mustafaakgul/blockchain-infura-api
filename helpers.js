module.export = {
    isEmpty: async function (text) {
        try {
            if (text == undefined)
                return true;

            if (text == null)
                return true;

            if (text.trim() == '')
                return true;

            return false;
        } catch (error) {
            return false;
        }
    }, replaceAll: function (str, search, replaceWith) {
        var result = str.split(search).join(replaceWith);
        return result;
    }
}