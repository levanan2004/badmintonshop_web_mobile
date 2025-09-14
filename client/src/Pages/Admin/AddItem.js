import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { API_CONFIG } from "../../config/api";

const AddProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token không tồn tại. Hãy đăng nhập lại.");
  }

  // State
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [productMultiImage, setMultiProductImage] = useState([]);
  const [productSummary, setProductSummary] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDiscount, setProductDiscount] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [specifications, setSpecifications] = useState([
    { SpecificationName: "", SpecificationContent: "" },
  ]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [clothingSizes, setClothingSizes] = useState([
    { size: "", quantity: 0 },
  ]);
  const [shoeSizes, setShoeSizes] = useState([{ size: "", quantity: 0 }]);
  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/brands`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, [token]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.SERVER_URL}/privatesite/categories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [token]);

  // Fetch product if edit
  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(
            `${API_CONFIG.SERVER_URL}/privatesite/productById/${id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const product = await response.json();
          setProductName(product.ProductName);
          setProductSummary(product.SummaryDescription);
          setProductDescription(product.Description);
          setProductPrice(product.Price);
          setProductDiscount(product.Discount);
          setProductBrand(product.IdBrand);
          setProductCategory(product.CategoryId || "");
          setSpecifications(product.Specifications || []);
          setProductId(product.ProductId);
          setProductImage(product.Avatar);
          if (product.Images) {
            setMultiProductImage(product.Images.map((img) => img.ImageUrl));
          }
          // Thêm phần này để set lại size khi sửa
          if (product.ClothingSizes && Array.isArray(product.ClothingSizes)) {
            setClothingSizes(
              product.ClothingSizes.map((item) => ({
                size: item.Size,
                quantity: item.Quantity,
              }))
            );
          } else {
            setClothingSizes([{ size: "", quantity: 0 }]);
          }
          if (product.ShoeSizes && Array.isArray(product.ShoeSizes)) {
            setShoeSizes(
              product.ShoeSizes.map((item) => ({
                size: item.Size,
                quantity: item.Quantity,
              }))
            );
          } else {
            setShoeSizes([{ size: "", quantity: 0 }]);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, token]);

  // Handlers
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setProductImage(file);
  };
  const handleMultiImageChange = (event) => {
    const files = Array.from(event.target.files);
    setMultiProductImage(files);
  };
  const handleSpecificationChange = (index, event) => {
    const newSpecifications = [...specifications];
    newSpecifications[index][event.target.name] = event.target.value;
    setSpecifications(newSpecifications);
  };
  const addSpecificationRow = () => {
    setSpecifications([
      ...specifications,
      { SpecificationName: "", SpecificationContent: "" },
    ]);
  };
  const handleEnter = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSpecificationRow();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!productCategory) {
      alert("Vui lòng chọn danh mục!");
      return;
    }

    // Log giá trị trước khi gửi
    console.log(
      "CategoryId FE gửi lên:",
      productCategory,
      typeof productCategory
    );

    const formData = new FormData();
    formData.append("ProductName", productName);
    formData.append("Description", productDescription);
    formData.append("SummaryDescription", productSummary);
    formData.append("Price", productPrice);
    formData.append("Discount", productDiscount);
    formData.append("IdBrand", productBrand);
    formData.append("CategoryId", Number(productCategory));
    formData.append("Avatar", productImage);
    formData.append("specifications", JSON.stringify(specifications));
    productMultiImage.forEach((image) => formData.append("Images", image));
    if (
      categories.find((cat) => cat.CategoryId == productCategory)
        ?.CategoryName === "Quần áo"
    ) {
      formData.append(
        "clothingSizes",
        JSON.stringify(clothingSizes.filter((s) => s.size))
      );
    }
    if (
      categories.find((cat) => cat.CategoryId == productCategory)
        ?.CategoryName === "Giày"
    ) {
      formData.append(
        "shoeSizes",
        JSON.stringify(shoeSizes.filter((s) => s.size))
      );
    }

    try {
      const url = isEdit
        ? `${API_CONFIG.SERVER_URL}/privatesite/addproduct/${id}`
        : `${API_CONFIG.SERVER_URL}/privatesite/addproduct`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        window.location.href = "/privatesite/productlist";
      } else {
        console.log("Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row ">
        <div className="col-lg-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-600 mb-4">
                {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h5>
              <form onSubmit={handleSubmit}>
                {isEdit && (
                  <p style={{ color: "#32a852" }}>
                    Đang sửa mã sản phẩm: {productId}
                  </p>
                )}

                <div className="mb-3">
                  <label htmlFor="productName" className="form-label fw-600">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    name="ProductName"
                    className="form-control"
                    id="productName"
                    placeholder="Nhập tên sản phẩm"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="productImage" className="form-label fw-600">
                    Hình ảnh đại diện
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    name="Avatar"
                    id="productImage"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {productImage && (
                    <div className="mt-3">
                      <img
                        id="imagePreview"
                        src={
                          typeof productImage === "string"
                            ? `${API_CONFIG.UPLOADS_URL}/uploads/${productImage}`
                            : URL.createObjectURL(productImage)
                        }
                        alt="Xem trước hình ảnh"
                        className="img-fluid"
                        style={{ display: "block", maxHeight: "200px" }}
                      />
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="productMultiImage"
                    className="form-label fw-600"
                  >
                    Hình ảnh
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    name="Images"
                    id="productMultiImage"
                    accept="image/*"
                    multiple
                    onChange={handleMultiImageChange}
                  />
                  <div
                    style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                  >
                    {productMultiImage &&
                      productMultiImage.map((image, index) => (
                        <div
                          key={index}
                          className="preview-image-container"
                          style={{
                            width: "300px",
                            height: "500px",
                            overflow: "hidden",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            position: "relative",
                          }}
                        >
                          <img
                            src={
                              typeof image === "string"
                                ? `${API_CONFIG.UPLOADS_URL}/uploads/${image}`
                                : URL.createObjectURL(image)
                            }
                            alt={`Xem trước hình ảnh ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        </div>
                      ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="productSummary" className="form-label fw-600">
                    Mô tả tóm tắt
                  </label>
                  <textarea
                    className="form-control"
                    name="SummaryDescription"
                    id="productSummary"
                    rows="2"
                    value={productSummary}
                    onChange={(e) => setProductSummary(e.target.value)}
                    placeholder="Nhập mô tả tóm tắt"
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="productDescription"
                    className="form-label fw-600"
                  >
                    Mô tả
                  </label>
                  <textarea
                    className="form-control"
                    name="Description"
                    id="productDescription"
                    rows="4"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Nhập mô tả chi tiết"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="productPrice" className="form-label fw-600">
                    Giá
                  </label>
                  <input
                    type="number"
                    name="Price"
                    className="form-control"
                    id="productPrice"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="Nhập giá sản phẩm"
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="productDiscount"
                    className="form-label fw-600"
                  >
                    Giảm giá
                  </label>
                  <input
                    type="number"
                    name="Discount"
                    className="form-control"
                    id="productDiscount"
                    value={productDiscount}
                    onChange={(e) => setProductDiscount(e.target.value)}
                    placeholder="Nhập giảm giá sản phẩm"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="productBrand" className="form-label fw-600">
                    Thương hiệu
                  </label>
                  <select
                    name="IdBrand"
                    className="form-select"
                    id="productBrand"
                    value={productBrand}
                    onChange={(e) => setProductBrand(e.target.value)}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {Array.isArray(brands) &&
                      brands.map((brand) => (
                        <option key={brand.BrandId} value={brand.BrandId}>
                          {brand.BrandName}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="productCategory"
                    className="form-label fw-600"
                  >
                    Danh mục
                  </label>
                  <select
                    name="CategoryId"
                    className="form-select"
                    id="productCategory"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                  >
                    <option value="">Chọn danh mục</option>
                    {Array.isArray(categories) &&
                      categories.map((cat) => (
                        <option key={cat.CategoryId} value={cat.CategoryId}>
                          {cat.CategoryName}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-600">Thông số kỹ thuật</label>
                  <div id="specifications">
                    {specifications.map((spec, index) => (
                      <div className="row mb-2" key={index}>
                        <div className="col-md-2">
                          <input
                            type="text"
                            className="form-control"
                            name="SpecificationName"
                            value={spec.SpecificationName}
                            onChange={(e) =>
                              handleSpecificationChange(index, e)
                            }
                            placeholder="Nhập thông số"
                            onKeyDown={handleEnter}
                          />
                        </div>
                        <div className="col-md-6">
                          <input
                            type="text"
                            className="form-control"
                            name="SpecificationContent"
                            value={spec.SpecificationContent}
                            onChange={(e) =>
                              handleSpecificationChange(index, e)
                            }
                            placeholder="Nhập nội dung thông số"
                            onKeyDown={handleEnter}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="col-md-2 d-flex align-items-center ">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={addSpecificationRow}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                {/* Size cho quần áo */}
                {productCategory &&
                  categories.find((cat) => cat.CategoryId == productCategory)
                    ?.CategoryName === "Quần áo" && (
                    <div className="mb-3">
                      <label className="form-label fw-600">Size quần áo</label>
                      {clothingSizes.map((item, idx) => (
                        <div key={idx} className="row mb-2">
                          <div className="col-md-3">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Size (VD: S, M, L, XL, XXL)"
                              value={item.size}
                              onChange={(e) => {
                                const arr = [...clothingSizes];
                                arr[idx].size = e.target.value;
                                setClothingSizes(arr);
                              }}
                            />
                          </div>
                          <div className="col-md-3">
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Số lượng"
                              value={item.quantity}
                              onChange={(e) => {
                                const arr = [...clothingSizes];
                                arr[idx].quantity = e.target.value;
                                setClothingSizes(arr);
                              }}
                            />
                          </div>
                          <div className="col-md-2">
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setClothingSizes(
                                  clothingSizes.filter((_, i) => i !== idx)
                                );
                              }}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          setClothingSizes([
                            ...clothingSizes,
                            { size: "", quantity: 0 },
                          ])
                        }
                      >
                        Thêm size
                      </button>
                    </div>
                  )}

                {/* Size cho giày */}
                {productCategory &&
                  categories.find((cat) => cat.CategoryId == productCategory)
                    ?.CategoryName === "Giày" && (
                    <div className="mb-3">
                      <label className="form-label fw-600">Size giày</label>
                      {shoeSizes.map((item, idx) => (
                        <div key={idx} className="row mb-2">
                          <div className="col-md-3">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Size (VD: 39, 40, 41, ...)"
                              value={item.size}
                              onChange={(e) => {
                                const arr = [...shoeSizes];
                                arr[idx].size = e.target.value;
                                setShoeSizes(arr);
                              }}
                            />
                          </div>
                          <div className="col-md-3">
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Số lượng"
                              value={item.quantity}
                              onChange={(e) => {
                                const arr = [...shoeSizes];
                                arr[idx].quantity = e.target.value;
                                setShoeSizes(arr);
                              }}
                            />
                          </div>
                          <div className="col-md-2">
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setShoeSizes(
                                  shoeSizes.filter((_, i) => i !== idx)
                                );
                              }}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          setShoeSizes([
                            ...shoeSizes,
                            { size: "", quantity: 0 },
                          ])
                        }
                      >
                        Thêm size
                      </button>
                    </div>
                  )}
                <div className="d-flex justify-content-end">
                  <Link to="/privatesite/Dashboard" className="btn btn-danger">
                    Quay về
                  </Link>
                  <button type="submit" className="btn btn-primary">
                    {isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
