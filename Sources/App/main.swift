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
    var code: [String] = []
    var variableWarnings: [String] = []
    var unknownWarnings: [String] = []
    if let xibPart = req.multipart?["xib"], let file = xibPart.file {
        let bytes = file.data
        let data = Data(bytes: bytes)
        let document = try XIBParser(data: data).document
        document.scanForDuplicateVariableNames()
        code = document.generateCode()
        unknownWarnings = document.warnings.map() { (warning) -> String? in
            if case let .unknownAttribute(message) = warning {
                return message
            }
            return nil
        }.flatMap() { $0 }
        variableWarnings = document.warnings.map() { (warning) -> String? in
            if case let .duplicateVariable(message) = warning {
                return message
            }
            return nil
        }.flatMap() { $0 }
    }
    var joiningWords = ["with", "and"]
    var summary = ["\(code.count) lines of code generated"]
    if variableWarnings.count > 0 {
        summary.append(joiningWords.removeFirst())
        summary.append("\(variableWarnings.count) duplicate variable names")
    }
    if unknownWarnings.count > 0 {
        summary.append(joiningWords.removeFirst())
        summary.append("\(unknownWarnings.count) unknown attributes")
    }
    let information =  [
        "summary": summary.joined(separator: " "),
        "code": code.joined(separator: "\n"),
        "variableWarnings": variableWarnings.joined(separator: "\n"),
        "unknownWarnings": unknownWarnings.joined(separator: "\n"),
        ]
    if req.multipart?["ajax"] != nil {
        return try drop.view.make("inline-result", information)
    }
    else {
        return try drop.view.make("result", information)
    }
}

drop.run()
