exports.verifyPermissions = async (sock, from, participant, isCommand, BOT_PHONE) => {

  if (!from.includes("@g.us") || !isCommand) return

  const { participants = [], owner = null } = await sock.groupMetadata(from);

  sock.user.id.split(":")[0] + "@s.whatsapp.net";

  if (!participants || participants.length === 0) {
    return {
      isAdmin: false,
      isBotAdmin: false,
      isOwnerGroup: false
    };
  }

  const admins = participants?.filter(user => user.admin == "admin" || user.admin == "superadmin");

  const isAdmin = !!admins?.find(admin => admin.id == participant || false);

  const isBotAdmin = !!admins?.find(admin => admin.id.includes(BOT_PHONE) || false);

  const isOwnerGroup = owner === participant

  return {
    isAdmin,
    isBotAdmin,
    isOwnerGroup
  };


};