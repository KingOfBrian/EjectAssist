import Vapor
import HTTP

final class EjectionController: ResourceRepresentable {
    func index(request: Request) throws -> ResponseRepresentable {
        return try Ejection.all().makeNode().converted(to: JSON.self)
    }

    func create(request: Request) throws -> ResponseRepresentable {
        var todo = try request.post()
        try todo.save()
        return todo
    }

    func show(request: Request, post: Ejection) throws -> ResponseRepresentable {
        return post
    }

    func delete(request: Request, post: Ejection) throws -> ResponseRepresentable {
        try post.delete()
        return JSON([:])
    }

    func replace(request: Request, post: Ejection) throws -> ResponseRepresentable {
        try post.delete()
        return try create(request: request)
    }

    func makeResource() -> Resource<Ejection> {
        return Resource(
            index: index,
            store: create,
            show: show,
            destroy: delete
        )
    }
}

extension Request {
    func post() throws -> Ejection {
        guard let json = json else { throw Abort.badRequest }
        return try Ejection(node: json)
    }
}
