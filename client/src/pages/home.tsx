import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GenesisHero } from "@/components/GenesisHero";
import { CherokeeCommandStrip } from "@/components/CherokeeCommandStrip";
import { ThreeDoors } from "@/components/ThreeDoors";
import { FourStepCTA } from "@/components/FourStepCTA";
import { WaitlistModal } from "@/components/WaitlistModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useState, useRef } from "react";
import { motion, useScroll, useInView, useSpring } from "framer-motion";
import {
  ArrowRight,
  Shield,
  CheckCircle2,
  TrendingUp,
  Vote,
  Zap,
  BarChart3,
  Lock,
  MapPin,
} from "lucide-react";
