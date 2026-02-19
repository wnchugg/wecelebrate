-- ============================================================================
-- Migration: Migrate Existing Content to Translations Structure
-- Description: Migrates existing site content from settings to translations
-- Author: Kiro AI
-- Date: February 19, 2026
-- Spec: .kiro/specs/multi-language-content/
-- Task: 2.1 Create migration script for all 16 priority sections
-- Requirements: 8.1-8.18
-- ============================================================================

-- This migration extracts existing English content from various settings fields
-- and moves them into the new translations JSONB structure.
-- All existing sites will have:
-- - defaultLanguage set to 'en'
-- - available_languages set to ['en']
-- - All existing content migrated to English translations

DO $$
DECLARE
  site_record RECORD;
  settings_data JSONB;
  branding_data JSONB;
  translations_data JSONB;
BEGIN
  RAISE NOTICE 'Starting content migration to translations structure...';
  
  -- Loop through all sites
  FOR site_record IN SELECT id, settings, branding FROM sites
  LOOP
    settings_data := COALESCE(site_record.settings, '{}'::jsonb);
    branding_data := COALESCE(site_record.branding, '{}'::jsonb);
    translations_data := '{}'::jsonb;
    
    -- ========================================================================
    -- HEADER SECTION
    -- ========================================================================
    
    -- Header: Logo Alt Text (from branding or site name)
    IF branding_data ? 'logoAlt' THEN
      translations_data := jsonb_set(
        translations_data,
        '{header,logoAlt,en}',
        to_jsonb(branding_data->>'logoAlt')
      );
    END IF;
    
    -- Header: Navigation Links (using default English values)
    translations_data := jsonb_set(translations_data, '{header,homeLink,en}', '"Home"');
    translations_data := jsonb_set(translations_data, '{header,productsLink,en}', '"Products"');
    translations_data := jsonb_set(translations_data, '{header,aboutLink,en}', '"About"');
    translations_data := jsonb_set(translations_data, '{header,contactLink,en}', '"Contact"');
    
    -- Header: CTA Button (from settings or default)
    IF settings_data ? 'headerCtaText' THEN
      translations_data := jsonb_set(
        translations_data,
        '{header,ctaButton,en}',
        to_jsonb(settings_data->>'headerCtaText')
      );
    ELSE
      translations_data := jsonb_set(translations_data, '{header,ctaButton,en}', '"Get Started"');
    END IF;
    
    -- ========================================================================
    -- WELCOME PAGE SECTION
    -- ========================================================================
    
    -- Welcome Page: Title
    IF settings_data ? 'welcomeTitle' THEN
      translations_data := jsonb_set(
        translations_data,
        '{welcomePage,title,en}',
        to_jsonb(settings_data->>'welcomeTitle')
      );
    ELSE
      translations_data := jsonb_set(translations_data, '{welcomePage,title,en}', '"Welcome"');
    END IF;
    
    -- Welcome Page: Message
    IF settings_data ? 'welcomeMessage' THEN
      translations_data := jsonb_set(
        translations_data,
        '{welcomePage,message,en}',
        to_jsonb(settings_data->>'welcomeMessage')
      );
    END IF;
    
    -- Welcome Page: Button Text
    IF settings_data ? 'welcomeButtonText' THEN
      translations_data := jsonb_set(
        translations_data,
        '{welcomePage,buttonText,en}',
        to_jsonb(settings_data->>'welcomeButtonText')
      );
    ELSE
      translations_data := jsonb_set(translations_data, '{welcomePage,buttonText,en}', '"Continue"');
    END IF;
    
    -- ========================================================================
    -- LANDING PAGE SECTION
    -- ========================================================================
    
    -- Landing Page: Hero Title
    IF settings_data ? 'landingHeroTitle' THEN
      translations_data := jsonb_set(
        translations_data,
        '{landingPage,heroTitle,en}',
        to_jsonb(settings_data->>'landingHeroTitle')
      );
    ELSIF settings_data->'landingPage'->'sections'->0->'content' ? 'title' THEN
      translations_data := jsonb_set(
        translations_data,
        '{landingPage,heroTitle,en}',
        settings_data->'landingPage'->'sections'->0->'content'->'title'
      );
    END IF;
    
    -- Landing Page: Hero Subtitle
    IF settings_data ? 'landingHeroSubtitle' THEN
      translations_data := jsonb_set(
        translations_data,
        '{landingPage,heroSubtitle,en}',
        to_jsonb(settings_data->>'landingHeroSubtitle')
      );
    ELSIF settings_data->'landingPage'->'sections'->0->'content' ? 'subtitle' THEN
      translations_data := jsonb_set(
        translations_data,
        '{landingPage,heroSubtitle,en}',
        settings_data->'landingPage'->'sections'->0->'content'->'subtitle'
      );
    END IF;
    
    -- Landing Page: Hero CTA
    IF settings_data ? 'landingHeroCTA' THEN
      translations_data := jsonb_set(
        translations_data,
        '{landingPage,heroCTA,en}',
        to_jsonb(settings_data->>'landingHeroCTA')
      );
    ELSIF settings_data->'landingPage'->'sections'->0->'content' ? 'ctaText' THEN
      translations_data := jsonb_set(
        translations_data,
        '{landingPage,heroCTA,en}',
        settings_data->'landingPage'->'sections'->0->'content'->'ctaText'
      );
    ELSE
      translations_data := jsonb_set(translations_data, '{landingPage,heroCTA,en}', '"Get Started"');
    END IF;
    
    -- ========================================================================
    -- ACCESS VALIDATION PAGE SECTION
    -- ========================================================================
    
    translations_data := jsonb_set(translations_data, '{accessPage,title,en}', '"Access Validation"');
    translations_data := jsonb_set(translations_data, '{accessPage,description,en}', '"Please verify your access to continue"');
    translations_data := jsonb_set(translations_data, '{accessPage,buttonText,en}', '"Verify"');
    translations_data := jsonb_set(translations_data, '{accessPage,errorMessage,en}', '"Validation failed. Please try again."');
    translations_data := jsonb_set(translations_data, '{accessPage,successMessage,en}', '"Access granted!"');
    
    -- ========================================================================
    -- CATALOG PAGE SECTION
    -- ========================================================================
    
    -- Catalog: Title
    IF settings_data ? 'catalogTitle' THEN
      translations_data := jsonb_set(
        translations_data,
        '{catalogPage,title,en}',
        to_jsonb(settings_data->>'catalogTitle')
      );
    ELSE
      translations_data := jsonb_set(translations_data, '{catalogPage,title,en}', '"Products"');
    END IF;
    
    -- Catalog: Description
    IF settings_data ? 'catalogDescription' THEN
      translations_data := jsonb_set(
        translations_data,
        '{catalogPage,description,en}',
        to_jsonb(settings_data->>'catalogDescription')
      );
    END IF;
    
    -- Catalog: Empty Message
    translations_data := jsonb_set(translations_data, '{catalogPage,emptyMessage,en}', '"No products available"');
    translations_data := jsonb_set(translations_data, '{catalogPage,filterAllText,en}', '"All"');
    translations_data := jsonb_set(translations_data, '{catalogPage,searchPlaceholder,en}', '"Search products..."');
    
    -- ========================================================================
    -- PRODUCT DETAIL PAGE SECTION
    -- ========================================================================
    
    translations_data := jsonb_set(translations_data, '{productDetail,backButton,en}', '"Back to Products"');
    translations_data := jsonb_set(translations_data, '{productDetail,addToCart,en}', '"Add to Cart"');
    translations_data := jsonb_set(translations_data, '{productDetail,buyNow,en}', '"Buy Now"');
    translations_data := jsonb_set(translations_data, '{productDetail,outOfStock,en}', '"Out of Stock"');
    translations_data := jsonb_set(translations_data, '{productDetail,specifications,en}', '"Specifications"');
    translations_data := jsonb_set(translations_data, '{productDetail,description,en}', '"Description"');
    
    -- ========================================================================
    -- CART PAGE SECTION
    -- ========================================================================
    
    translations_data := jsonb_set(translations_data, '{cartPage,title,en}', '"Shopping Cart"');
    translations_data := jsonb_set(translations_data, '{cartPage,emptyMessage,en}', '"Your cart is empty"');
    translations_data := jsonb_set(translations_data, '{cartPage,emptyDescription,en}', '"Add some products to get started"');
    translations_data := jsonb_set(translations_data, '{cartPage,browseButton,en}', '"Browse Products"');
    translations_data := jsonb_set(translations_data, '{cartPage,removeButton,en}', '"Remove"');
    translations_data := jsonb_set(translations_data, '{cartPage,clearCartButton,en}', '"Clear Cart"');
    translations_data := jsonb_set(translations_data, '{cartPage,clearCartConfirm,en}', '"Are you sure you want to clear your cart?"');
    translations_data := jsonb_set(translations_data, '{cartPage,subtotalLabel,en}', '"Subtotal"');
    translations_data := jsonb_set(translations_data, '{cartPage,shippingLabel,en}', '"Shipping"');
    translations_data := jsonb_set(translations_data, '{cartPage,taxLabel,en}', '"Tax"');
    translations_data := jsonb_set(translations_data, '{cartPage,totalLabel,en}', '"Total"');
    translations_data := jsonb_set(translations_data, '{cartPage,checkoutButton,en}', '"Proceed to Checkout"');
    translations_data := jsonb_set(translations_data, '{cartPage,continueShoppingButton,en}', '"Continue Shopping"');
    translations_data := jsonb_set(translations_data, '{cartPage,securityNotice,en}', '"Your information is secure"');
    
    -- ========================================================================
    -- CHECKOUT PAGE SECTION
    -- ========================================================================
    
    translations_data := jsonb_set(translations_data, '{checkoutPage,title,en}', '"Checkout"');
    translations_data := jsonb_set(translations_data, '{checkoutPage,shippingTitle,en}', '"Shipping Information"');
    translations_data := jsonb_set(translations_data, '{checkoutPage,paymentTitle,en}', '"Payment Information"');
    translations_data := jsonb_set(translations_data, '{checkoutPage,orderSummary,en}', '"Order Summary"');
    translations_data := jsonb_set(translations_data, '{checkoutPage,placeOrderButton,en}', '"Place Order"');
    translations_data := jsonb_set(translations_data, '{checkoutPage,freeShippingMessage,en}', '"Free shipping on all orders"');
    
    -- ========================================================================
    -- REVIEW ORDER PAGE SECTION
    -- ========================================================================
    
    translations_data := jsonb_set(translations_data, '{reviewOrder,title,en}', '"Review Your Order"');
    translations_data := jsonb_set(translations_data, '{reviewOrder,instructions,en}', '"Please review your order details before confirming"');
    translations_data := jsonb_set(translations_data, '{reviewOrder,confirmButton,en}', '"Confirm Order"');
    translations_data := jsonb_set(translations_data, '{reviewOrder,editButton,en}', '"Edit"');
    translations_data := jsonb_set(translations_data, '{reviewOrder,shippingLabel,en}', '"Shipping Address"');
    translations_data := jsonb_set(translations_data, '{reviewOrder,itemsLabel,en}', '"Items"');
    
    -- ========================================================================
    -- CONFIRMATION PAGE SECTION
    -- ========================================================================
    
    translations_data := jsonb_set(translations_data, '{confirmation,title,en}', '"Order Confirmed!"');
    translations_data := jsonb_set(translations_data, '{confirmation,message,en}', '"Thank you for your order. We''ll send you a confirmation email shortly."');
    translations_data := jsonb_set(translations_data, '{confirmation,orderNumberLabel,en}', '"Order Number"');
    translations_data := jsonb_set(translations_data, '{confirmation,trackingLabel,en}', '"Tracking Number"');
    translations_data := jsonb_set(translations_data, '{confirmation,nextSteps,en}', '"You will receive an email with tracking information once your order ships."');
    translations_data := jsonb_set(translations_data, '{confirmation,continueButton,en}', '"Continue Shopping"');
    
    -- ========================================================================
    -- ORDER HISTORY PAGE SECTION
    -- ========================================================================
    
    translations_data := jsonb_set(translations_data, '{orderHistory,title,en}', '"Order History"');
    translations_data := jsonb_set(translations_data, '{orderHistory,description,en}', '"View your past orders and track shipments"');
    translations_data := jsonb_set(translations_data, '{orderHistory,emptyTitle,en}', '"No Orders Yet"');
    translations_data := jsonb_set(translations_data, '{orderHistory,emptyMessage,en}', '"You haven''t placed any orders yet"');
    translations_data := jsonb_set(translations_data, '{orderHistory,browseButton,en}', '"Browse Products"');
    translations_data := jsonb_set(translations_data, '{orderHistory,viewDetailsButton,en}', '"View Details"');
    translations_data := jsonb_set(translations_data, '{orderHistory,statusPending,en}', '"Pending"');
    translations_data := jsonb_set(translations_data, '{orderHistory,statusConfirmed,en}', '"Confirmed"');
    translations_data := jsonb_set(translations_data, '{orderHistory,statusShipped,en}', '"Shipped"');
    translations_data := jsonb_set(translations_data, '{orderHistory,statusDelivered,en}', '"Delivered"');
    translations_data := jsonb_set(translations_data, '{orderHistory,statusCancelled,en}', '"Cancelled"');
    
    -- ========================================================================
    -- ORDER TRACKING PAGE SECTION
    -- ========================================================================
    
    translations_data := jsonb_set(translations_data, '{orderTracking,title,en}', '"Track Your Order"');
    translations_data := jsonb_set(translations_data, '{orderTracking,orderNumberLabel,en}', '"Order Number"');
    translations_data := jsonb_set(translations_data, '{orderTracking,placedOnLabel,en}', '"Placed On"');
    translations_data := jsonb_set(translations_data, '{orderTracking,statusLabel,en}', '"Status"');
    translations_data := jsonb_set(translations_data, '{orderTracking,orderPlacedLabel,en}', '"Order Placed"');
    translations_data := jsonb_set(translations_data, '{orderTracking,orderPlacedDesc,en}', '"Your order has been received"');
    translations_data := jsonb_set(translations_data, '{orderTracking,orderConfirmedLabel,en}', '"Order Confirmed"');
    translations_data := jsonb_set(translations_data, '{orderTracking,orderConfirmedDesc,en}', '"Your order has been confirmed and is being prepared"');
    translations_data := jsonb_set(translations_data, '{orderTracking,shippedLabel,en}', '"Shipped"');
    translations_data := jsonb_set(translations_data, '{orderTracking,shippedDesc,en}', '"Your order is on its way"');
    translations_data := jsonb_set(translations_data, '{orderTracking,deliveredLabel,en}', '"Delivered"');
    translations_data := jsonb_set(translations_data, '{orderTracking,deliveredDesc,en}', '"Your order has been delivered"');
    translations_data := jsonb_set(translations_data, '{orderTracking,trackingNumberLabel,en}', '"Tracking Number"');
    translations_data := jsonb_set(translations_data, '{orderTracking,estimatedDeliveryLabel,en}', '"Estimated Delivery"');
    translations_data := jsonb_set(translations_data, '{orderTracking,giftDetailsLabel,en}', '"Gift Details"');
    translations_data := jsonb_set(translations_data, '{orderTracking,shippingAddressLabel,en}', '"Shipping Address"');
    translations_data := jsonb_set(translations_data, '{orderTracking,returnHomeButton,en}', '"Return Home"');
    translations_data := jsonb_set(translations_data, '{orderTracking,printButton,en}', '"Print"');
    translations_data := jsonb_set(translations_data, '{orderTracking,supportMessage,en}', '"Need help? Contact our support team"');
    
    -- ========================================================================
    -- NOT FOUND PAGE SECTION
    -- ========================================================================
    
    translations_data := jsonb_set(translations_data, '{notFoundPage,title,en}', '"Page Not Found"');
    translations_data := jsonb_set(translations_data, '{notFoundPage,message,en}', '"The page you''re looking for doesn''t exist"');
    translations_data := jsonb_set(translations_data, '{notFoundPage,homeButton,en}', '"Go Home"');
    translations_data := jsonb_set(translations_data, '{notFoundPage,adminLoginButton,en}', '"Admin Login"');
    translations_data := jsonb_set(translations_data, '{notFoundPage,clientPortalButton,en}', '"Client Portal"');
    
    -- ========================================================================
    -- PRIVACY POLICY PAGE SECTION
    -- ========================================================================
    
    translations_data := jsonb_set(translations_data, '{privacyPolicy,title,en}', '"Privacy Policy"');
    translations_data := jsonb_set(translations_data, '{privacyPolicy,lastUpdated,en}', '"Last Updated"');
    translations_data := jsonb_set(translations_data, '{privacyPolicy,introductionTitle,en}', '"Introduction"');
    translations_data := jsonb_set(translations_data, '{privacyPolicy,introductionText,en}', '"We respect your privacy and are committed to protecting your personal data."');
    translations_data := jsonb_set(translations_data, '{privacyPolicy,informationCollectedTitle,en}', '"Information We Collect"');
    translations_data := jsonb_set(translations_data, '{privacyPolicy,howWeUseTitle,en}', '"How We Use Your Information"');
    translations_data := jsonb_set(translations_data, '{privacyPolicy,yourRightsTitle,en}', '"Your Rights"');
    translations_data := jsonb_set(translations_data, '{privacyPolicy,dataSecurityTitle,en}', '"Data Security"');
    translations_data := jsonb_set(translations_data, '{privacyPolicy,contactTitle,en}', '"Contact Us"');
    translations_data := jsonb_set(translations_data, '{privacyPolicy,privacySettingsButton,en}', '"Privacy Settings"');
    
    -- ========================================================================
    -- SELECTION PERIOD EXPIRED PAGE SECTION
    -- ========================================================================
    
    translations_data := jsonb_set(translations_data, '{expiredPage,title,en}', '"Selection Period Expired"');
    translations_data := jsonb_set(translations_data, '{expiredPage,message,en}', '"The selection period for this site has ended"');
    translations_data := jsonb_set(translations_data, '{expiredPage,contactMessage,en}', '"Please contact your administrator for assistance"');
    translations_data := jsonb_set(translations_data, '{expiredPage,returnHomeButton,en}', '"Return Home"');
    
    -- ========================================================================
    -- FOOTER SECTION
    -- ========================================================================
    
    -- Footer: Text
    IF settings_data ? 'footerText' THEN
      translations_data := jsonb_set(
        translations_data,
        '{footer,text,en}',
        to_jsonb(settings_data->>'footerText')
      );
    ELSE
      translations_data := jsonb_set(translations_data, '{footer,text,en}', '"© 2026 All rights reserved"');
    END IF;
    
    translations_data := jsonb_set(translations_data, '{footer,privacyLink,en}', '"Privacy Policy"');
    translations_data := jsonb_set(translations_data, '{footer,termsLink,en}', '"Terms of Service"');
    translations_data := jsonb_set(translations_data, '{footer,contactLink,en}', '"Contact Us"');
    
    -- ========================================================================
    -- UPDATE SITE WITH TRANSLATIONS AND LANGUAGE SETTINGS
    -- ========================================================================
    
    -- Update the site with translations and language configuration
    UPDATE sites
    SET
      translations = translations_data,
      available_languages = ARRAY['en'],
      settings = jsonb_set(
        COALESCE(settings, '{}'::jsonb),
        '{defaultLanguage}',
        '"en"'
      ),
      updated_at = NOW()
    WHERE id = site_record.id;
    
    RAISE NOTICE 'Migrated content for site: %', site_record.id;
  END LOOP;
  
  RAISE NOTICE 'Content migration completed successfully!';
END $$;

-- Add comment to document the migration
COMMENT ON COLUMN sites.translations IS 'JSONB object storing multi-language translations for site content. Migrated from settings fields on 2026-02-19. Structure: { section: { field: { languageCode: text } } }';
