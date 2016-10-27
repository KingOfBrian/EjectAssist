import Vapor
import EjectKit
import Foundation
let drop = Droplet()

drop.get { req in
    return try drop.view.make("eject", [
    	"message": drop.localization[req.lang, "welcome", "title"]
    ])
}

drop.post("eject") { req in
    var code: String = ""
    if let xibPart = req.multipart?["xib"], let file = xibPart.file {
        let bytes = file.data
        let data = Data(bytes: bytes)
        let builder = try XIBParser(data: data)
        code = builder.document.generateCode().joined(separator: "\n")
    }

    return try drop.view.make("result", [
        "code": code
        ])
}

// Future version should allow for browsing:
drop.resource("ejection", EjectionController())

drop.run()
