using FluentValidation;
using MediatR;

namespace LuuTastyTreats.Api.Modules.Catalog.Features.CreateCake;

public static class CreateCakeEndpoint
{
    public static void MapCreateCakeEndpoint(this RouteGroupBuilder group)
    {
        group.MapPost("/admin/cakes", async (
            CreateCakeRequest request,
            IValidator<CreateCakeRequest> validator,
            IMediator mediator,
            CancellationToken ct) =>
        {
            var validation = await validator.ValidateAsync(request, ct);
            if (!validation.IsValid)
                return Results.ValidationProblem(validation.ToDictionary());

            var result = await mediator.Send(new CreateCakeCommand(request.Name, request.Description, request.BasePrice, request.CategoryId), ct);

            return result switch
            {
                CreateCakeResult.Success s => Results.Created($"/api/v1/cakes/{s.CakeId}", new
                {
                    cakeId = s.CakeId,
                    name = s.Name,
                    basePrice = s.BasePrice,
                    baseImageUrl = s.BaseImageUrl,
                    isActive = s.IsActive
                }),
                CreateCakeResult.CategoryNotFound => Results.BadRequest(new { error = "Category not found." }),
                _ => Results.Problem("Unexpected result.")
            };
        })
        .RequireAuthorization("AdminOrAbove")
        .WithName("CreateCake")
        .Produces(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .ProducesValidationProblem();
    }
}
