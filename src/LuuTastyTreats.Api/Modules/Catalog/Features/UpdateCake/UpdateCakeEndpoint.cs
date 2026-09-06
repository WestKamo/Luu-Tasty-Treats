using FluentValidation;
using MediatR;
namespace LuuTastyTreats.Api.Modules.Catalog.Features.UpdateCake;
public static class UpdateCakeEndpoint {
    public static void MapUpdateCakeEndpoint(this RouteGroupBuilder group) {
        group.MapPut("/admin/cakes/{id:guid}", async (Guid id, UpdateCakeRequest request, IValidator<UpdateCakeRequest> validator, IMediator mediator, CancellationToken ct) => {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid) return Results.ValidationProblem(validation.ToDictionary());
            var command = new UpdateCakeCommand(id, request.Name, request.Description, request.BasePrice, request.IsActive, request.CategoryId);
            var result = await mediator.Send(command, ct);
            return result switch {
                UpdateCakeResult.Success s => Results.Ok(new { cakeId = s.CakeId, name = s.Name, basePrice = s.BasePrice, isActive = s.IsActive }),
                UpdateCakeResult.CakeNotFound => Results.NotFound(new { error = "Cake not found." }),
                UpdateCakeResult.CategoryNotFound => Results.BadRequest(new { error = "Category not found." }),
                _ => Results.Problem("Unexpected result.")
            };
        }).RequireAuthorization("SuperAdminOnly").WithName("UpdateCake").Produces(StatusCodes.Status200OK).Produces(StatusCodes.Status404NotFound).Produces(StatusCodes.Status400BadRequest).ProducesValidationProblem();
    }
}
