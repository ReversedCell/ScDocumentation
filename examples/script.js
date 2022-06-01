// example script for v27.269

const module = Process.findModuleByName("libg.so");
const base = module.base;
Memory.protect(base, module.size, "rwx");

function killProtections() {
	base.add(0x35BE60).writeByteArray([0xF2, 0x03, 0x00, 0xEA]); // TcpSocket::create
	base.add(0x3A2C18).writeByteArray([0x32, 0x04, 0x00, 0xEA]); // LoginMessage::encode
	base.add(0x3E48D8).writeByteArray([0xB5, 0x04, 0x00, 0xEA]); // InputSystem::update
	base.add(0x3E48DC).writeByteArray([0x00, 0xF0, 0x20, 0xE3]); // InputSystem::update
	base.add(0x49A658).writeByteArray([0x16, 0x05, 0x00, 0xEA]); // CombatHUD::ultiButtonActivated
	base.add(0x49A65C).writeByteArray([0x00, 0xF0, 0x20, 0xE3]); // CombatHUD::ultiButtonActivated
}

function replaceKey() {
	Interceptor.replace(base.add(0x667050), new NativeCallback(function(bytes) { // randombytes
		bytes.writeByteArray([0x08, 0x19, 0xCD, 0x3F, 0x35, 0xD8, 0xD4, 0x6C, 0x5F, 0xE0, 0x92, 0xE4, 0x1A, 0x44, 0xAB, 0x34, 0x6F, 0xBF, 0x71, 0x30, 0xA3, 0xC9, 0x9B, 0xF9, 0x96, 0x87, 0x36, 0x72, 0x85, 0xF3, 0x4C, 0x20]);
  	}, 'void', ['pointer']));
}

function redirect(host) {
	Interceptor.attach(Module.findExportByName(null, "getaddrinfo"), {
		onEnter(args) {
			if (args[0].readUtf8String() == "game.brawlstarsgame.com") {
				args[0].writeUtf8String(host);
			}
		}
	});
	
	Interceptor.attach(base.add(0x5D36C), function() { // bypass addr check!
		this.context.r1 = 0x22;
		this.context.r2 = 0x22;
	});
}

rpc.exports.init = function() {
	killProtections();
	replaceKey();
	redirect("127.0.0.1");
};
