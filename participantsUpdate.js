const fs = require("fs")

exports.participantsUpdate = async(sock) =>{
  
  sock.ev.on('group-participants.update', async ({id,participants, action})=>{
    
    const bemVindo = JSON.parse(fs.readFileSync("data/bemVindo.json"));
    
    const isBemVindo = bemVindo.includes(id);
  
    try{
      
      if(action == "add" && isBemVindo){
    
    try{
      
      var imgPerfil = await sock.profilePictureUrl(participants[0], "image");
      
    }catch(error){
      console.log(error)
      
      var imgPerfil = "https://telegra.ph/file/b5427ea4b8701bc47e751.jpg"
    }
    
    const textWelcome = `Ola, seja bem vindo, @${participants[0].split("@")[0]}`
    
    
    await sock.sendMessage(id, {
      image: { url: imgPerfil },
      caption: textWelcome,
      mentions: [participants[0]]
    })
    
      }
    
    }catch(error){
      console.log(error)
    }
    
  })
  
}