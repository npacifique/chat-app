const generateMessage = (username, text)=>({
    username, 
    text , 
    createdAt : new Date().getTime()
})


const generateLocation = (username, url)=>({
    username, 
    url , 
    createdAt : new Date().getTime(),

})


module.exports = {
    generateMessage, 
    generateLocation
}