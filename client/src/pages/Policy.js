import React from "react";
import Layout from "./../components/Layout";

const Policy = () => {
  return (
    <Layout title={"Privacy Policy"}>
      <div className="row contactus mt-4">
        <div className="col-md-6 ">
          <img
            src="/images/contactus.jpeg"
            alt="contactus"
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-md-4">
          <p>At Virtual Vault, we respect your privacy and are committed 
            to protecting it. This Privacy Policy explains how we collect, 
            use, and safeguard your information when you visit our website. 
            Please read this policy carefully. If you do not agree with the 
            terms of this privacy policy, please do not access the site.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Policy;