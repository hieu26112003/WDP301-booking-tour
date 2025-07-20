import React from "react";
import CallbackRequestForm from "./CallbackRequestForm";
import ContactInfo from "./ContactInfo";
import FeedbackForm from "./FeedbackForm";

const ContactPage = () => {
    return (
        <div className="container py-5">
            <div className="row">
                {/* Bên trái */}
                <div className="col-md-4">
                    <div className="mb-4">
                        <CallbackRequestForm />
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="mb-4">
                        <ContactInfo />
                    </div>
                </div>

                {/* Bên phải */}
                <div className="col-md-4">
                    <div className="mb-4">
                        <FeedbackForm />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
