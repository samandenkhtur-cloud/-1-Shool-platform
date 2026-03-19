class BaseController {
  ok(res, data) {
    return res.status(200).json(data);
  }

  created(res, data) {
    return res.status(201).json(data);
  }

  noContent(res) {
    return res.status(204).send();
  }
}

module.exports = { BaseController };

