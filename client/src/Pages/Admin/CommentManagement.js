import React, { useEffect, useMemo, useState } from "react";
import { API_CONFIG } from "../../config/api";
import axios from "axios";
import Swal from "sweetalert2";

const API = API_CONFIG.SERVER_URL;
const getAuth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
});
const fmt = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleString();
};

export default function CommentManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productId, setProductId] = useState("");
  const [q, setQ] = useState("");
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  // Modal quản lý phản hồi
  const [replyModal, setReplyModal] = useState({
    open: false,
    comment: null,
    data: [],
    loading: false,
    error: "",
  });

  // Lấy danh sách sản phẩm
  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`, getAuth());
      const list = Array.isArray(res.data) ? res.data : res.data?.result ?? [];
      setProducts(list);
      return list;
    } catch {
      setProducts([]);
      return [];
    }
  };

  const productNameOf = (pid) =>
    products.find((p) => String(p.ProductId) === String(pid))?.ProductName ||
    pid;

  // Lấy tất cả bình luận
  const fetchAllComments = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await loadProducts();
      if (!list.length) {
        setRows([]);
        setLoading(false);
        return;
      }
      const requests = list.map((p) =>
        axios
          .get(`${API}/comments/${encodeURIComponent(p.ProductId)}`, getAuth())
          .then((r) => ({
            pid: p.ProductId,
            items: Array.isArray(r.data) ? r.data : r.data?.result ?? [],
          }))
          .catch(() => ({ pid: p.ProductId, items: [] }))
      );
      const results = await Promise.all(requests);
      const merged = results.flatMap((r) =>
        r.items.map((it) => ({ ...it, ProductId: it.ProductId || r.pid }))
      );
      setRows(merged);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e.message ||
          "Lỗi khi tải tất cả bình luận"
      );
    } finally {
      setLoading(false);
    }
  };

  // Lấy bình luận theo ProductId
  const fetchByProduct = async () => {
    if (!productId) {
      setMessage("Bạn phải nhập ProductId để tải bình luận của sản phẩm đó.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (!products.length) await loadProducts();
      const res = await axios.get(
        `${API}/comments/${encodeURIComponent(productId)}`,
        getAuth()
      );
      setRows(Array.isArray(res.data) ? res.data : res.data?.result ?? []);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e.message ||
          "Lỗi khi tải danh sách bình luận"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (!kw) return true;
      const fields = [
        r.Content,
        r.content,
        r.ProductId,
        r.Account?.Username,
        r.Account?.Email,
        r.Account?.Firstname,
        r.Account?.Lastname,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return fields.includes(kw);
    });
  }, [rows, q]);

  // Modal quản lý phản hồi
  const openReplies = async (comment) => {
    setReplyModal((m) => ({
      ...m,
      open: true,
      comment,
      loading: true,
      error: "",
      data: [],
    }));
    try {
      const res = await axios.get(
        `${API}/comments/${comment.CommentId}/replies`,
        getAuth()
      );
      const data = Array.isArray(res.data) ? res.data : res.data?.result ?? [];
      setReplyModal({ open: true, comment, data, loading: false, error: "" });
    } catch (e) {
      setReplyModal({
        open: true,
        comment,
        data: [],
        loading: false,
        error: e?.response?.data?.message || e.message,
      });
    }
  };

  const deleteReply = async (replyId) => {
    const result = await Swal.fire({
      title: `Xóa phản hồi #${replyId}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API}/comments/reply/${replyId}`, getAuth());
      setReplyModal((m) => ({
        ...m,
        data: (m.data || []).filter((r) => r.ReplyId !== replyId),
      }));
    } catch (e) {
      Swal.fire("Lỗi", e?.response?.data?.message || e.message, "error");
    }
  };

  const closeReplies = () =>
    setReplyModal({
      open: false,
      comment: null,
      data: [],
      loading: false,
      error: "",
    });

  // Xóa bình luận
  const onDelete = async (comment) => {
    const result = await Swal.fire({
      title: `Xóa bình luận #${comment.CommentId}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API}/comments/${comment.CommentId}`, getAuth());
      setRows((s) => s.filter((x) => x.CommentId !== comment.CommentId));
      setMessage("Xóa bình luận thành công!");
    } catch (e) {
      Swal.fire("Lỗi", e?.response?.data?.message || e.message, "error");
    }
  };

  // Table row
  const Row = ({ r, idx }) => (
    <tr key={r.CommentId}>
      <td className="text-center">{idx + 1}</td>
      <td className="text-center">#{r.CommentId}</td>
      <td className="text-center">
        <span className="fw-600">{productNameOf(r.ProductId)}</span>
        <div style={{ color: "#6b7280", fontSize: 12 }}>
          (ID: {r.ProductId})
        </div>
      </td>
      <td className="text-center">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <strong>
            {r.Account?.Username ||
              `${r.Account?.Firstname ?? ""} ${r.Account?.Lastname ?? ""}`}
          </strong>
          <span style={{ color: "#6b7280", fontSize: 12 }}>
            {r.Account?.Email}
          </span>
        </div>
      </td>
      <td>{r.Content || r.content}</td>
      <td className="text-center">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>{fmt(r.createdAt || r.createAt)}</span>
          <span style={{ color: "#6b7280", fontSize: 12 }}>
            Sửa: {fmt(r.updatedAt || r.updateAt)}
          </span>
        </div>
      </td>
      <td className="text-center">
        <button
          className="btn btn-sm btn-info"
          onClick={() => openReplies(r)}
          title="Xem phản hồi"
        >
          Xem phản hồi
        </button>
      </td>
      <td className="text-center">
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(r)}>
          Xóa
        </button>
      </td>
    </tr>
  );

  return (
    <div className="container-fluid">
      {message && <div className="alert alert-info">{message}</div>}
      <div className="row">
        <div className="col-lg-12 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body p-4">
              <h5 className="card-title fw-600 mb-4">Quản lý bình luận</h5>
              <div className="mb-3 d-flex gap-3">
                <input
                  className="form-control"
                  placeholder="Nhập ProductId (lọc theo sản phẩm)"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  style={{ maxWidth: 200 }}
                />
                <button
                  className="btn btn-primary"
                  onClick={fetchByProduct}
                  disabled={!productId || loading}
                >
                  Lọc
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={fetchAllComments}
                  disabled={loading}
                >
                  Làm mới
                </button>
                <input
                  className="form-control"
                  placeholder="Tìm theo nội dung, username, email…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  style={{ maxWidth: 300 }}
                />
              </div>
              {error && (
                <div className="alert alert-danger mb-3">⚠️ {error}</div>
              )}
              <div className="table-responsive">
                <table className="table text-nowrap mb-0 align-middle">
                  <thead className="text-dark fs-4">
                    <tr>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Id</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">CommentId</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Sản phẩm</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Người bình luận</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Nội dung</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Thời gian</h6>
                      </th>
                      <th className=" text-center">
                        <h6 className="fw-600 mb-0">Phản hồi</h6>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <Row key={r.CommentId} r={r} idx={i} />
                    ))}
                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          style={{ textAlign: "center", padding: 24 }}
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {loading && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: 16,
                    }}
                  >
                    <div className="loader" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal quản lý phản hồi */}
      {replyModal.open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: "min(900px, 94vw)",
              background: "#fff",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <strong>
                Phản hồi của bình luận #{replyModal.comment?.CommentId}
              </strong>
              <button className="btn btn-secondary" onClick={closeReplies}>
                Đóng
              </button>
            </div>
            <div style={{ padding: 12 }}>
              {replyModal.loading && <div>Đang tải phản hồi…</div>}
              {replyModal.error && (
                <div className="alert alert-danger mb-2">
                  ⚠️ {replyModal.error}
                </div>
              )}
              {!replyModal.loading && !replyModal.error && (
                <div className="table-responsive">
                  <table className="table text-nowrap mb-0 align-middle">
                    <thead>
                      <tr>
                        <th className="text-center">#</th>
                        <th className="text-center">ReplyId</th>
                        <th className="text-center">Người trả lời</th>
                        <th className="text-center">Nội dung</th>
                        <th className="text-center">Thời gian</th>
                        <th className="text-center">Lệnh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {replyModal.data.map((rp, i) => (
                        <tr key={rp.ReplyId}>
                          <td className="text-center">{i + 1}</td>
                          <td className="text-center">#{rp.ReplyId}</td>
                          <td className="text-center">
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <strong>
                                {rp.Account?.Username ||
                                  `${rp.Account?.Firstname ?? ""} ${
                                    rp.Account?.Lastname ?? ""
                                  }`}
                              </strong>
                              <span style={{ color: "#6b7280", fontSize: 12 }}>
                                {rp.Account?.Email}
                              </span>
                            </div>
                          </td>
                          <td>{rp.Content}</td>
                          <td className="text-center">{fmt(rp.CreatedAt)}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteReply(rp.ReplyId)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                      {replyModal.data.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            style={{ textAlign: "center", padding: 16 }}
                          >
                            Chưa có phản hồi
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
