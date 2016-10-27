import Vapor
import Fluent
import Foundation

final class Ejection: Model {
    var id: Node?
    var xml: String?
    var code: String?
    var warnings: String
    
    init(node: Node, in context: Context) throws {
        id = try node.extract("id")
        xml = try node.extract("xml")
        code = try node.extract("code")
        warnings = try node.extract("warnings")
    }

    func makeNode(context: Context) throws -> Node {
        return try Node(node: [
            "id": id,
            "xml": xml,
            "code": code,
            "warnings": warnings,
        ])
    }
}
	

extension Ejection: Preparation {
    static func prepare(_ database: Database) throws {
        //
    }

    static func revert(_ database: Database) throws {
        //
    }
}
