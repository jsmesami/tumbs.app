def customer(request):
    return {"customer": request.session.get("customer")}
