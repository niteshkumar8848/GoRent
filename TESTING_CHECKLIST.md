# GoRent Testing Checklist

## Pre-Test Setup

### Backend
- [ ] Server is running without errors
- [ ] MongoDB connection is established
- [ ] Environment variables are configured:
  - [ ] MONGO_URI
  - [ ] JWT_SECRET
  - [ ] PORT

### Frontend
- [ ] Frontend is running
- [ ] REACT_APP_API_URL is set correctly

---

## API Endpoint Testing

### Health Check
- [ ] GET `/api/health` returns 200 OK
- [ ] Response contains status: "ok"

### Auth Endpoints

#### Register
- [ ] POST `/api/auth/register` with valid data returns 201
- [ ] Response contains token and user object
- [ ] POST `/api/auth/register` with missing fields returns 400
- [ ] POST `/api/auth/register` with existing email returns 400
- [ ] POST `/api/auth/register` with invalid email returns 400

#### Login
- [ ] POST `/api/auth/login` with valid credentials returns 200
- [ ] Response contains token and user object
- [ ] POST `/api/auth/login` with wrong password returns 400
- [ ] POST `/api/auth/login` with non-existent email returns 400
- [ ] POST `/api/auth/login` with missing fields returns 400

#### Get Profile
- [ ] GET `/api/auth/me` with valid token returns 200
- [ ] GET `/api/auth/me` without token returns 401
- [ ] GET `/api/auth/me` with invalid token returns 401

#### Update Profile
- [ ] PUT `/api/auth/me` with valid data updates profile
- [ ] PUT `/api/auth/me` without current password for email change returns 400

### Vehicle Endpoints

#### Get All Vehicles
- [ ] GET `/api/vehicles` returns 200
- [ ] Response is an array
- [ ] GET `/api/vehicles?search=keyword` filters results
- [ ] GET `/api/vehicles?maxPrice=1000` filters by price
- [ ] GET `/api/vehicles?brand=Toyota` filters by brand

#### Get Single Vehicle
- [ ] GET `/api/vehicles/:id` with valid ID returns 200
- [ ] GET `/api/vehicles/:id` with invalid ID format returns 400
- [ ] GET `/api/vehicles/:id` with non-existent ID returns 404

#### Create Vehicle (Admin Only)
- [ ] POST `/api/vehicles` without auth returns 401
- [ ] POST `/api/vehicles` with regular user token returns 403
- [ ] POST `/api/vehicles` with admin token creates vehicle
- [ ] POST `/api/vehicles` with image uploads works
- [ ] POST `/api/vehicles` with invalid data returns 400

#### Update Vehicle (Admin Only)
- [ ] PUT `/api/vehicles/:id` updates vehicle
- [ ] PUT `/api/vehicles/:id` with image replaces image

#### Delete Vehicle (Admin Only)
- [ ] DELETE `/api/vehicles/:id` deletes vehicle
- [ ] DELETE `/api/vehicles/:id` with invalid ID returns 400

### Booking Endpoints

#### Create Booking
- [ ] POST `/api/bookings` without auth returns 401
- [ ] POST `/api/bookings` with valid data creates booking
- [ ] POST `/api/bookings` with non-existent vehicle returns 404
- [ ] POST `/api/bookings` with unavailable vehicle returns 400
- [ ] POST `/api/bookings` with invalid dates returns 400

#### Get User Bookings
- [ ] GET `/api/bookings` returns user's bookings
- [ ] GET `/api/bookings` without auth returns 401

#### Get All Bookings (Admin)
- [ ] GET `/api/bookings/all` with admin token returns all bookings
- [ ] GET `/api/bookings/all` with regular user returns 403

#### Update Booking Status (Admin)
- [ ] PUT `/api/bookings/:id/status` updates status

#### Cancel Booking
- [ ] PUT `/api/bookings/:id/cancel` cancels booking
- [ ] PUT `/api/bookings/:id/cancel` by non-owner returns 403

#### Delete Booking (Admin)
- [ ] DELETE `/api/bookings/:id` deletes booking

---

## Frontend Testing

### Authentication
- [ ] User can register with valid data
- [ ] User cannot register with existing email
- [ ] User can login with correct credentials
- [ ] User sees error with wrong credentials
- [ ] User is redirected after login
- [ ] Admin is redirected to /admin
- [ ] Regular user is redirected to /

### Home Page
- [ ] Vehicles are displayed
- [ ] Search works
- [ ] Filter by brand works
- [ ] Filter by price works
- [ ] Booking modal opens
- [ ] Booking can be created (when logged in)
- [ ] Login required prompt when not logged in

### User Dashboard
- [ ] Profile info is displayed
- [ ] Profile can be updated

### Admin Dashboard
- [ ] All bookings are displayed
- [ ] Booking status can be changed
- [ ] Vehicles can be added
- [ ] Vehicles can be edited
- [ ] Vehicles can be deleted
- [ ] Vehicle availability can be toggled
- [ ] Admin can update profile

### Booking Page
- [ ] User's bookings are displayed
- [ ] Booking can be cancelled
- [ ] Status is displayed correctly

---

## Error Handling Tests

### Backend
- [ ] Invalid JSON in request body returns 400
- [ ] Invalid ObjectId returns 400
- [ ] Database errors are handled gracefully
- [ ] Server doesn't crash on bad requests
- [ ] Proper error messages are returned

### Frontend
- [ ] Error messages are displayed to users
- [ ] Loading states are shown
- [ ] Empty states are handled
- [ ] Network errors are handled

---

## Performance Tests

- [ ] Page loads in under 3 seconds
- [ ] API calls complete in under 5 seconds
- [ ] No memory leaks on long sessions
- [ ] Polling doesn't cause performance issues

---

## Browser Compatibility

- [ ] Chrome - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work
- [ ] Edge - All features work

---

## Mobile Responsiveness

- [ ] Home page is responsive
- [ ] Dashboard is usable on mobile
- [ ] Forms are usable on mobile
- [ ] Navigation works on mobile

