using CatalogService.Application.DTOs.Cuisine;

namespace CatalogService.Application.Interfaces
{

    public interface ICuisineService
    {
        Task<IEnumerable<CuisineDto>> GetAllAsync();

        Task<CuisineDto> GetByIdAsync(Guid id);

        Task<Guid> CreateAsync(CreateCuisineDto dto);

        Task UpdateAsync(Guid id, UpdateCuisineDto dto);

        Task DeleteAsync(Guid id);
    }
}
